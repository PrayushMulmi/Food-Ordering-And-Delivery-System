import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, ImageWithFallback, Tabs, TabsContent, TabsList, TabsTrigger } from '../shared/ui';
import { api, fileUrl } from '../lib/api';
import { isLoggedIn } from '../lib/auth';
import { toast } from 'sonner';
import { notifyBasketChanged } from '../lib/basket';

export function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ restaurant: null, menu: [], reviews: [] });
  const [busyId, setBusyId] = useState(null);
  const [basketNotice, setBasketNotice] = useState(null);

  useEffect(() => {
    api.get(`/api/restaurants/${id}`).then((res) => setData(res.data || { restaurant: null, menu: [], reviews: [] })).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!basketNotice) return undefined;
    const timer = window.setTimeout(() => setBasketNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [basketNotice]);

  const groupedMenu = useMemo(() => data.menu.reduce((acc, item) => {
    const key = item.category || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {}), [data.menu]);

  const menuLookup = useMemo(() => new Map(data.menu.map((item) => [Number(item.id), item])), [data.menu]);

  const ensureAuth = () => {
    if (isLoggedIn()) return true;
    navigate('/login', { state: { from: `/restaurant/${id}` } });
    return false;
  };

  const addToBasket = async (menuItemId, goCheckout = false) => {
    if (!ensureAuth()) return;
    setBusyId(menuItemId);
    try {
      await api.post('/api/basket/items', { menu_item_id: menuItemId, quantity: 1 });
      notifyBasketChanged();

      if (goCheckout) {
        navigate('/order-checkout');
      } else {
        const item = menuLookup.get(Number(menuItemId));
        setBasketNotice({
          itemName: item?.name || 'Item',
          price: Number(item?.price || 0),
        });
      }
    } catch (error) {
      toast.error(error.message.includes('single restaurant') ? 'Your basket already contains items from another restaurant. Clear the basket first.' : (error.message || 'Could not add item'));
    } finally {
      setBusyId(null);
    }
  };

  const restaurant = data.restaurant;
  if (!restaurant) return <div className="container mx-auto px-4 py-10">Loading restaurant...</div>;

  return (
    <>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8 overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="h-64 bg-gray-100"><ImageWithFallback src={fileUrl(restaurant.cover_photo_url || restaurant.image_url)} alt={restaurant.name} className="h-full w-full object-cover" /></div>
          <div className="p-8">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-4xl font-bold">{restaurant.name}</h1><p className="mt-2 text-lg text-gray-600">{restaurant.description}</p></div><Badge className="text-sm">{Number(restaurant.rating_average || 0).toFixed(1)}★</Badge></div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500"><span>{restaurant.cuisine}</span><span>•</span><span>{restaurant.address}</span><span>•</span><span>{restaurant.price_level}</span><span>•</span><span>{restaurant.is_open ? 'Open now' : 'Closed'}</span></div>
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
                <section key={category} className="rounded-3xl border bg-white p-6 shadow-sm">
                  <h2 className="mb-5 text-2xl font-semibold">{category}</h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex flex-col gap-4 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex gap-4">
                          <div className="h-24 w-24 overflow-hidden rounded-2xl bg-gray-100"><ImageWithFallback src={fileUrl(item.image_url)} alt={item.name} className="h-full w-full object-cover" /></div>
                          <div><h3 className="text-lg font-semibold">{item.name}</h3><p className="mt-1 text-sm text-gray-600">{item.description}</p><p className="mt-2 font-semibold text-[#16A34A]">Rs. {Number(item.price || 0).toFixed(2)}</p></div>
                        </div>
                        <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={busyId === item.id} onClick={() => addToBasket(item.id, false)}>Add to basket</Button><Button disabled={busyId === item.id} onClick={() => addToBasket(item.id, true)}>Order now</Button></div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-semibold">About {restaurant.name}</h2>
                <p className="text-gray-700">{restaurant.description || 'Restaurant details will be updated soon.'}</p>
                <div className="mt-6 space-y-2 text-sm text-gray-600"><p><span className="font-semibold text-gray-900">Cuisine:</span> {restaurant.cuisine}</p><p><span className="font-semibold text-gray-900">Address:</span> {restaurant.address}</p><p><span className="font-semibold text-gray-900">Phone:</span> {restaurant.contact_phone || 'Not added yet'}</p><p><span className="font-semibold text-gray-900">Price level:</span> {restaurant.price_level}</p></div>
              </div>
              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-semibold">Gallery</h2>
                <div className="grid grid-cols-2 gap-3">{(restaurant.gallery_images || [restaurant.cover_photo_url, restaurant.image_url]).filter(Boolean).slice(0, 6).map((img, idx) => <div key={idx} className="h-32 overflow-hidden rounded-2xl bg-gray-100"><ImageWithFallback src={fileUrl(img)} alt={`${restaurant.name} ${idx + 1}`} className="h-full w-full object-cover" /></div>)}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-semibold">Customer reviews</h2><Button variant="ghost" asChild><Link to="/reviews">Your reviews</Link></Button></div>
              <div className="space-y-4">{data.reviews.map((review) => <div key={review.id} className="rounded-2xl border p-4"><div className="flex items-center justify-between gap-3"><p className="font-medium">{review.customer_name}</p><Badge variant="secondary">{review.rating}/5</Badge></div><p className="mt-1 text-sm text-gray-500">{review.menu_item_name}</p><p className="mt-3 text-sm text-gray-700">{review.comment || 'No written comment provided.'}</p></div>)}{!data.reviews.length && <p className="text-sm text-gray-500">No reviews available yet.</p>}</div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {basketNotice && (
        <div className="fixed bottom-24 right-5 z-[60] w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl border bg-white p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Added to basket</p>
              <h3 className="text-lg font-semibold">{basketNotice.itemName}</h3>
              <p className="mt-1 text-sm text-gray-600">Rs. {basketNotice.price.toFixed(2)}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setBasketNotice(null)}>Close</Button>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { setBasketNotice(null); navigate('/basket'); }}>View basket</Button>
            <Button className="flex-1" onClick={() => { setBasketNotice(null); navigate('/order-checkout'); }}>Checkout</Button>
          </div>
        </div>
      )}
    </>
  );
}
