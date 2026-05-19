import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Badge,
  Button,
  ConfirmDialog,
  ImageWithFallback,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../shared/ui";
import { api, fileUrl } from "../lib/api";
import { getUser, isLoggedIn } from "../lib/auth";
import { getRoleHomePath } from "../shared/navigation";
import { toast } from "sonner";
import { notifyBasketChanged } from "../lib/basket";
import {
  buildOsmEmbedSrc,
  buildOpenStreetMapMarkerUrl,
  parseCoordinatesFromMapUrl,
} from "../utils/location";

function getInitials(name = "") {
  const words = String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const initials = words.map((word) => word[0]?.toUpperCase()).join("");
  return initials || "R";
}

function getRestaurantCoordinates(restaurant) {
  const lat = Number(restaurant?.latitude);
  const lng = Number(restaurant?.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  return parseCoordinatesFromMapUrl(restaurant?.restaurant_location_url);
}

export function RestaurantDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ restaurant: null, menu: [], reviews: [] });
  const [busyId, setBusyId] = useState(null);
  const [basketNotice, setBasketNotice] = useState(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearingBasket, setClearingBasket] = useState(false);
  const [updatingNoticeItemId, setUpdatingNoticeItemId] = useState(null);

  useEffect(() => {
    api
      .get(`/api/restaurants/${code}`)
      .then((res) =>
        setData(res.data || { restaurant: null, menu: [], reviews: [] }),
      )
      .catch(() => {});
  }, [code]);

  useEffect(() => {
    if (!basketNotice || clearDialogOpen) return undefined;
    const timer = window.setTimeout(() => setBasketNotice(null), 7000);
    return () => window.clearTimeout(timer);
  }, [basketNotice, clearDialogOpen]);

  const groupedMenu = useMemo(
    () =>
      data.menu.reduce((acc, item) => {
        const key = item.category || "General";
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {}),
    [data.menu],
  );

  const menuLookup = useMemo(
    () => new Map(data.menu.map((item) => [Number(item.id), item])),
    [data.menu],
  );

  const ensureAuth = () => {
    const user = getUser();
    if (isLoggedIn() && user?.role === 'customer') return true;
    if (isLoggedIn() && user?.role) {
      navigate(getRoleHomePath(user.role), { replace: true });
      return false;
    }
    navigate("/login", { state: { from: `/restaurant/${code}` } });
    return false;
  };

  const addToBasket = async (menuItemId, goCheckout = false) => {
    if (!ensureAuth()) return;
    setBusyId(menuItemId);
    try {
      const response = await api.post("/api/basket/items", {
        menu_item_id: menuItemId,
        quantity: 1,
      });
      const nextBasket = response.data || { items: [] };
      notifyBasketChanged();

      if (goCheckout) {
        navigate("/order-checkout");
      } else {
        const item = menuLookup.get(Number(menuItemId));
        setBasketNotice({
          ...nextBasket,
          addedItemName: item?.name || "Item",
        });
      }
    } catch (error) {
      toast.error(
        error.message.includes("single restaurant")
          ? "Your basket already contains items from another restaurant. Clear the basket first."
          : error.message || "Could not add item",
      );
    } finally {
      setBusyId(null);
    }
  };

  const restaurant = data.restaurant;
  if (!restaurant)
    return (
      <div className="container mx-auto px-4 py-10">Loading restaurant...</div>
    );

  const restaurantCoordinates = getRestaurantCoordinates(restaurant);
  const restaurantMapSrc = restaurantCoordinates
    ? buildOsmEmbedSrc({ coordinates: restaurantCoordinates })
    : "";
  const restaurantMapLink = restaurantCoordinates
    ? buildOpenStreetMapMarkerUrl(restaurantCoordinates)
    : restaurant.restaurant_location_url;
  const galleryImages = (
    restaurant.gallery_images?.length
      ? restaurant.gallery_images
      : [restaurant.cover_photo_url, restaurant.image_url]
  ).filter(Boolean);
  const restaurantClosed = !restaurant.is_open;
  const noticeItems = basketNotice?.items || [];
  const noticeTotalQty = noticeItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );
  const noticeSubtotal = Number(basketNotice?.subtotal || 0);
  const noticePreviewItems = noticeItems.slice(0, 4);
  const noticeRemainingItems = Math.max(
    noticeItems.length - noticePreviewItems.length,
    0,
  );

  const updateNoticeItemQuantity = async (itemId, quantity) => {
    setUpdatingNoticeItemId(itemId);

    try {
      const response =
        quantity <= 0
          ? await api.delete(`/api/basket/items/${itemId}`)
          : await api.put(`/api/basket/items/${itemId}`, { quantity });

      const nextBasket = response.data || { items: [], subtotal: 0 };

      setBasketNotice((current) =>
        nextBasket.items?.length
          ? { ...nextBasket, addedItemName: current?.addedItemName || "Item" }
          : null,
      );

      notifyBasketChanged();
    } catch (error) {
      toast.error(error.message || "Could not update basket");
    } finally {
      setUpdatingNoticeItemId(null);
    }
  };

  const increaseNoticeQuantity = (item) => {
    updateNoticeItemQuantity(item.id, Number(item.quantity || 0) + 1);
  };

  const decreaseNoticeQuantity = (item) => {
    updateNoticeItemQuantity(item.id, Number(item.quantity || 0) - 1);
  };

  const clearBasketFromNotice = async () => {
    setClearingBasket(true);
    try {
      await api.delete("/api/basket");
      setBasketNotice(null);
      setClearDialogOpen(false);
      notifyBasketChanged();
      toast.success("Basket cleared");
    } catch (error) {
      toast.error(error.message || "Could not clear basket");
    } finally {
      setClearingBasket(false);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="h-64 bg-gray-100">
            <ImageWithFallback
              src={fileUrl(restaurant.cover_photo_url || restaurant.image_url)}
              alt={restaurant.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative p-8 pt-16">
            <div className="absolute -top-12 left-8 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#f0fdf4] text-2xl font-bold text-[#166534] shadow-lg">
              {restaurant.image_url ? (
                <ImageWithFallback
                  src={fileUrl(restaurant.image_url)}
                  alt={`${restaurant.name} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{getInitials(restaurant.name)}</span>
              )}
            </div>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold">{restaurant.name}</h1>
                <p className="mt-2 text-lg text-gray-600">
                  {restaurant.description}
                </p>
              </div>
              <Badge className="text-sm">
                {Number(restaurant.rating_average || 0).toFixed(1)}★
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <span>{restaurant.cuisine}</span>
              <span>•</span>
              <span>{restaurant.address}</span>
              <span>•</span>
              <span>{restaurant.price_level}</span>
              <span>•</span>
              <span className={restaurant.is_open ? "font-semibold text-[#16A34A]" : "font-semibold text-red-600"}>{restaurant.is_open ? "Open now" : "Closed"}</span>
            </div>
            {restaurantClosed && (
              <p className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                This restaurant is currently closed. You can view the menu, but ordering is disabled until it opens.
              </p>
            )}
          </div>
        </div>

        <Tabs defaultValue="menu" className="space-y-6">
          <TabsList className="grid h-14 w-full grid-cols-3">
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <div className="space-y-6">
              {Object.entries(groupedMenu).map(([category, items]) => (
                <section
                  key={category}
                  className="rounded-3xl border bg-white p-6 shadow-sm"
                >
                  <h2 className="mb-5 text-2xl font-semibold">{category}</h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-4 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="flex gap-4">
                          <div className="h-24 w-24 overflow-hidden rounded-2xl bg-gray-100">
                            <ImageWithFallback
                              src={fileUrl(item.image_url)}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">
                              {item.description}
                            </p>
                            <p className="mt-2 font-semibold text-[#16A34A]">
                              Rs. {Number(item.price || 0).toFixed(2)}
                            </p>
                            {!item.is_available && <p className="mt-1 text-xs font-semibold text-red-600">Currently unavailable</p>}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            disabled={restaurantClosed || !item.is_available || busyId === item.id}
                            onClick={() => addToBasket(item.id, false)}
                          >
                            Add to basket
                          </Button>
                          <Button
                            disabled={restaurantClosed || !item.is_available || busyId === item.id}
                            onClick={() => addToBasket(item.id, true)}
                          >
                            Order now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              <div className="space-y-6">
                <div className="rounded-3xl border bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-2xl font-semibold">
                    About {restaurant.name}
                  </h2>
                  <p className="text-gray-700">
                    {restaurant.description ||
                      "Restaurant details will be updated soon."}
                  </p>
                  <div className="mt-6 space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-semibold text-gray-900">
                        Cuisine:
                      </span>{" "}
                      {restaurant.cuisine}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Address:
                      </span>{" "}
                      {restaurant.address}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Phone:
                      </span>{" "}
                      {restaurant.contact_phone || "Not added yet"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Price level:
                      </span>{" "}
                      {restaurant.price_level}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border bg-white p-6 shadow-sm">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-semibold">Location</h2>
                    {restaurantMapLink && (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={restaurantMapLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open on OpenStreetMap
                        </a>
                      </Button>
                    )}
                  </div>
                  {restaurantMapSrc ? (
                    <div className="overflow-hidden rounded-2xl border bg-gray-100">
                      <iframe
                        title={`${restaurant.name} OpenStreetMap location`}
                        src={restaurantMapSrc}
                        className="h-[300px] w-full border-0"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <p className="rounded-2xl border border-dashed p-4 text-sm text-gray-500">
                      Location not available
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-semibold">Gallery</h2>
                <div className="grid grid-cols-2 gap-3">
                  {galleryImages.slice(0, 6).map((img, idx) => (
                    <div
                      key={idx}
                      className="h-32 overflow-hidden rounded-2xl bg-gray-100"
                    >
                      <ImageWithFallback
                        src={fileUrl(img)}
                        alt={`${restaurant.name} ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {!galleryImages.length && (
                  <p className="rounded-2xl border border-dashed p-4 text-sm text-gray-500">
                    No gallery photos available yet.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Customer reviews</h2>
                <Button variant="ghost" asChild>
                  <Link to="/reviews">Your reviews</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {data.reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{review.customer_name}</p>
                      <Badge variant="secondary">{review.rating}/5</Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {review.menu_item_name}
                    </p>
                    <p className="mt-3 text-sm text-gray-700">
                      {review.comment || "No written comment provided."}
                    </p>
                  </div>
                ))}
                {!data.reviews.length && (
                  <p className="text-sm text-gray-500">
                    No reviews available yet.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {basketNotice && (
        <div className="fixed bottom-24 right-5 z-[60] w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl border bg-white p-5 shadow-2xl print:hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Added to basket</p>
              <h3 className="text-lg font-semibold">Basket summary</h3>
              <p className="mt-1 text-sm text-gray-600">
                {basketNotice.addedItemName} added • {noticeTotalQty} item
                {noticeTotalQty > 1 ? "s" : ""} • Rs.{" "}
                {noticeSubtotal.toFixed(2)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBasketNotice(null)}
            >
              Close
            </Button>
          </div>
          <div className="mt-4 max-h-56 space-y-2 overflow-auto">
            {noticePreviewItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-2xl border p-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.name}</p>

                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      disabled={updatingNoticeItemId === item.id}
                      onClick={() => decreaseNoticeQuantity(item)}
                      aria-label={`Decrease ${item.name} quantity`}
                    >
                      −
                    </Button>

                    <span className="min-w-6 text-center font-semibold">
                      {item.quantity}
                    </span>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      disabled={updatingNoticeItemId === item.id}
                      onClick={() => increaseNoticeQuantity(item)}
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <p className="shrink-0 font-semibold">
                  Rs. {Number(item.total_price || 0).toFixed(2)}
                </p>
              </div>
            ))}
            {noticeRemainingItems > 0 && (
              <p className="rounded-2xl border border-dashed p-3 text-center text-sm text-gray-500">
                + {noticeRemainingItems} more item
                {noticeRemainingItems > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setBasketNotice(null);
                navigate("/basket");
              }}
            >
              View basket
            </Button>
            <Button
              onClick={() => {
                setBasketNotice(null);
                navigate("/order-checkout");
              }}
            >
              Checkout
            </Button>
            <Button
              variant="destructive"
              className="col-span-2"
              onClick={() => setClearDialogOpen(true)}
            >
              Clear Basket
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={clearDialogOpen}
        title="Clear basket?"
        description="This will remove all items from your basket. Your basket will stay unchanged if you cancel."
        confirmText={clearingBasket ? "Clearing..." : "Clear Basket"}
        confirmVariant="destructive"
        onCancel={() => setClearDialogOpen(false)}
        onConfirm={clearBasketFromNotice}
      />
    </>
  );
}
