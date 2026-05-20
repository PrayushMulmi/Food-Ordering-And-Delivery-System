import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearSession, getUser, isLoggedIn } from "../lib/auth";
import {
  ChevronRight,
  Moon,
  Search,
  ShoppingBasket,
  Sun,
  User,
} from "lucide-react";
import { Button, ConfirmDialog, Input } from "./ui";
import imgLogo from "../assets/43f7673940367781fb7ec14544ebbbad91e6ffee.png";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { BASKET_UPDATED_EVENT, notifyBasketChanged } from "../lib/basket";
import { getRoleHomePath, getRoleProfilePath } from "./navigation";
import { applyTheme, getStoredTheme } from "../lib/theme";
import { FoodChatbot } from "../components/FoodChatbot";

function BasketPopup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [basket, setBasket] = useState({ items: [] });
  const [open, setOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearingBasket, setClearingBasket] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const loggedIn = isLoggedIn();
  const hidden = [
    "/login",
    "/signup",
    "/basket",
    "/checkout",
    "/order-checkout",
  ].includes(location.pathname);

  const fetchBasket = useCallback(async () => {
    const res = await api.get("/api/basket");
    setBasket(res.data || { items: [] });
  }, []);

  useEffect(() => {
    if (!loggedIn || hidden) return;
    fetchBasket().catch(() => {});
  }, [fetchBasket, hidden, location.pathname, loggedIn]);

  useEffect(() => {
    if (!loggedIn) return undefined;
    const handleBasketUpdate = () => fetchBasket().catch(() => {});
    window.addEventListener(BASKET_UPDATED_EVENT, handleBasketUpdate);
    return () =>
      window.removeEventListener(BASKET_UPDATED_EVENT, handleBasketUpdate);
  }, [fetchBasket, loggedIn]);

  const totalQty = useMemo(
    () =>
      (basket.items || []).reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0,
      ),
    [basket],
  );
  const totalAmount = useMemo(() => Number(basket.subtotal || 0), [basket]);
  const summaryItems = useMemo(
    () => (basket.items || []).slice(0, 4),
    [basket],
  );
  const remainingItems = Math.max(
    (basket.items || []).length - summaryItems.length,
    0,
  );

  useEffect(() => {
    if (!totalQty) setOpen(false);
  }, [totalQty]);

  const updateCartItemQuantity = async (itemId, quantity) => {
    setUpdatingItemId(itemId);

    try {
      const response =
        quantity <= 0
          ? await api.delete(`/api/basket/items/${itemId}`)
          : await api.put(`/api/basket/items/${itemId}`, { quantity });

      const nextBasket = response.data || { items: [], subtotal: 0 };
      setBasket(nextBasket);

      if (!nextBasket.items?.length) {
        setOpen(false);
      }

      notifyBasketChanged();
    } catch (error) {
      toast.error(error.message || "Could not update basket");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const increaseQuantity = (item) => {
    updateCartItemQuantity(item.id, Number(item.quantity || 0) + 1);
  };

  const decreaseQuantity = (item) => {
    updateCartItemQuantity(item.id, Number(item.quantity || 0) - 1);
  };

  const clearBasket = async () => {
    setClearingBasket(true);
    try {
      await api.delete("/api/basket");
      setBasket({ items: [], subtotal: 0 });
      setOpen(false);
      setClearDialogOpen(false);
      notifyBasketChanged();
      toast.success("Basket cleared");
    } catch (error) {
      toast.error(error.message || "Could not clear basket");
    } finally {
      setClearingBasket(false);
    }
  };

  if (!loggedIn || hidden || !totalQty) return null;

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end print:hidden">
        {open && (
          <div className="absolute bottom-16 right-0 w-[360px] max-w-[calc(100vw-2rem)] rounded-3xl border bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {basket.restaurant_name || "Your basket"}
                </p>
                <h3 className="text-xl font-bold">Basket summary</h3>
                <p className="text-sm text-gray-600">
                  {totalQty} item{totalQty > 1 ? "s" : ""} • Rs.{" "}
                  {totalAmount.toFixed(2)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
            <div className="max-h-72 space-y-3 overflow-auto">
              {summaryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        disabled={updatingItemId === item.id}
                        onClick={() => decreaseQuantity(item)}
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        −
                      </Button>

                      <span className="min-w-6 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        disabled={updatingItemId === item.id}
                        onClick={() => increaseQuantity(item)}
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <p className="shrink-0 text-sm font-semibold">
                    Rs. {Number(item.total_price || 0).toFixed(2)}
                  </p>
                </div>
              ))}
              {remainingItems > 0 && (
                <p className="rounded-2xl border border-dashed p-3 text-center text-sm text-gray-500">
                  + {remainingItems} more item{remainingItems > 1 ? "s" : ""} in
                  basket
                </p>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => navigate("/basket")}>
                Expand
              </Button>
              <Button onClick={() => navigate("/order-checkout")}>
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
        <button
          onClick={() => setOpen((value) => !value)}
          className="flex items-center gap-3 rounded-full bg-[#22C55E] px-5 py-3 text-sm font-semibold text-white shadow-xl hover:bg-[#16A34A]"
        >
          <ShoppingBasket className="h-5 w-5" />
          <span>{totalQty}</span>
          <span>Basket</span>
          <ChevronRight
            className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
          />
        </button>
      </div>

      <ConfirmDialog
        open={clearDialogOpen}
        title="Clear basket?"
        description="This will remove all items from your basket. Your basket will stay unchanged if you cancel."
        confirmText={clearingBasket ? "Clearing..." : "Clear Basket"}
        confirmVariant="destructive"
        onCancel={() => setClearDialogOpen(false)}
        onConfirm={clearBasket}
      />
    </>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState(getStoredTheme());

  useEffect(() => {
    const refreshTheme = () => setTheme(getStoredTheme());
    window.addEventListener('storage', refreshTheme);
    window.addEventListener('auth:session-changed', refreshTheme);
    return () => {
      window.removeEventListener('storage', refreshTheme);
      window.removeEventListener('auth:session-changed', refreshTheme);
    };
  }, []);

  const toggleTheme = async () => {
    const previous = theme;
    const next = applyTheme(theme === "dark" ? "light" : "dark");
    setTheme(next);

    if (isLoggedIn()) {
      try {
        let res;
        try {
          res = await api.put('/api/auth/me/theme', { theme: next });
        } catch (themeRouteError) {
          if (!/route not found/i.test(themeRouteError.message || '')) throw themeRouteError;
          res = await api.put('/api/auth/me', { theme: next });
        }
        if (res?.data) applyTheme(res.data.theme || next);
      } catch (error) {
        applyTheme(previous);
        setTheme(previous);
        toast.error(error.message || 'Could not save theme preference');
      }
    }
  };
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title="Toggle light/dark theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}

function HeaderBasketButton({ loggedIn, role }) {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  const loadCount = useCallback(async () => {
    if (!loggedIn || role !== "customer") {
      setCount(0);
      return;
    }
    const res = await api.get("/api/basket");
    const total = (res.data?.items || []).reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    );
    setCount(total);
  }, [loggedIn, role]);

  useEffect(() => {
    loadCount().catch(() => setCount(0));
  }, [loadCount]);

  useEffect(() => {
    const refresh = () => loadCount().catch(() => setCount(0));
    window.addEventListener(BASKET_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(BASKET_UPDATED_EVENT, refresh);
  }, [loadCount]);

  if (!loggedIn || role !== "customer") return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => navigate("/basket")}
      className="relative"
      title="Open basket"
    >
      <ShoppingBasket className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#22C55E] px-1 text-[11px] font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  );
}

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const loggedIn = isLoggedIn();
  const [search, setSearch] = useState("");
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
  }, [location.pathname, location.search]);

  const profilePath = getRoleProfilePath(user?.role);
  const logoutPath =
    user?.role === "customer" ? "/" : getRoleHomePath(user?.role);

  const guardNavigate = (path) => {
    if (!loggedIn) return navigate("/login", { state: { from: path } });
    navigate(path);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = search.trim();
    navigate(
      query
        ? `/restaurants?search=${encodeURIComponent(query)}`
        : "/restaurants",
    );
  };

  const confirmLogout = () => {
    clearSession();
    setLogoutDialogOpen(false);
    toast.success("Logged out successfully", { duration: 5000 });
    navigate(logoutPath);
  };

  const navCls = (path) =>
    `cursor-pointer text-[15px] font-medium transition-colors hover:text-[#22C55E] dark:hover:text-[#22C55E] ${location.pathname === path ? "text-[#22C55E] font-semibold" : "text-gray-700 dark:text-gray-100"}`;

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur dark:bg-black/95 dark:text-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={imgLogo} alt="Annaya" className="h-14 w-auto" />
            </Link>
            <form
              onSubmit={handleSearch}
              className="relative hidden max-w-xl flex-1 md:flex"
            >
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants or menu items..."
                className="h-11 pr-10"
              />
              <button type="submit" className="absolute right-3 top-3">
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </form>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <HeaderBasketButton loggedIn={loggedIn} role={user?.role} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => guardNavigate(profilePath)}
              >
                <User className="h-5 w-5" />
              </Button>
              {loggedIn ? (
                <Button
                  className="hidden bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 sm:inline-flex"
                  onClick={() => setLogoutDialogOpen(true)}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  className="hidden bg-[#22C55E] text-white hover:bg-[#16A34A] sm:inline-flex"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
              )}
            </div>
          </div>
          <nav className="flex h-12 items-center justify-center gap-6 border-t dark:border-white/10">
            <Link to="/" className={navCls("/")}>
              Home
            </Link>
            <Link to="/restaurants" className={navCls("/restaurants")}>
              Restaurants
            </Link>
            <button
              onClick={() => guardNavigate("/orders")}
              className={navCls("/orders")}
            >
              Order History
            </button>
            <button
              onClick={() => guardNavigate("/reviews")}
              className={navCls("/reviews")}
            >
              Reviews
            </button>
          </nav>
          <form onSubmit={handleSearch} className="pb-3 md:hidden">
            <div className="relative">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants or menu items..."
                className="pr-10"
              />
              <button type="submit" className="absolute right-3 top-3">
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </form>
        </div>
      </header>
      <BasketPopup />
      <FoodChatbot enabled={loggedIn && user?.role === "customer"} />
      <ConfirmDialog
        open={logoutDialogOpen}
        title="Log out?"
        description="You will need to sign in again to access your account."
        confirmText="Logout"
        confirmVariant="destructive"
        onCancel={() => setLogoutDialogOpen(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-gray-100 print:hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Annaya</h3>
            <p className="text-sm leading-6 text-gray-600">Fresh meals from local restaurants, simple ordering, live order updates, and clear digital bills.</p>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Explore</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-600 transition-colors hover:text-[#22C55E]">About Us</Link></li>
              <li><Link to="/faqs" className="text-gray-600 transition-colors hover:text-[#22C55E]">FAQs</Link></li>
              <li><Link to="/terms-and-conditions" className="text-gray-600 transition-colors hover:text-[#22C55E]">Terms & Conditions</Link></li>
              <li><Link to="/restaurants" className="text-gray-600 transition-colors hover:text-[#22C55E]">Restaurants</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Customer links</h3>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-gray-600 transition-colors hover:text-[#22C55E]">Customer login</Link></li>
              <li><Link to="/orders" className="text-gray-600 transition-colors hover:text-[#22C55E]">Order history</Link></li>
              <li><Link to="/reviews" className="text-gray-600 transition-colors hover:text-[#22C55E]">Reviews</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact</h3>
            <ul className="space-y-2 text-gray-600">
              <li>support@annaya.test</li>
              <li>Kathmandu, Nepal</li>
              <li>Open daily with restaurant availability shown live.</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-gray-500">
          <p>&copy; 2026 Annaya Food Delivery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
