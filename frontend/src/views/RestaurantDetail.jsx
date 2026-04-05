import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { ImageWithFallback } from "../shared/ui";
import { Button } from "../shared/ui";
import { Badge } from "../shared/ui";
import { Input } from "../shared/ui";
import { Star, MapPin, Clock, Search, Plus, Minus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
const mockMenuItems = [
  {
    id: 1,
    name: "Delicious Gourmet Burger",
    restaurant: "Rudra Cafe",
    description: "Buttery buns with cheese, minced chicken and hot sauce filling",
    price: 443,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1632898657953-f41f81bfa892?crop=entropy&cs=tinysrgb&fit=max&fm=jpg"
  },
  {
    id: 2,
    name: "R&B's Special Burger",
    restaurant: "Rudra Cafe",
    description: "Buttery buns with cheese, onions, spinach, soya sauce and mayonnaise",
    price: 320,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1632898657953-f41f81bfa892?crop=entropy&cs=tinysrgb&fit=max&fm=jpg"
  },
  {
    id: 3,
    name: "Chicken Laphing",
    restaurant: "Rudra Cafe",
    description: "Spicy cold noodle dish with chicken and special sauce",
    price: 250,
    category: "Laphing",
    image: "https://images.unsplash.com/photo-1542666836-03522463be07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg"
  },
  {
    id: 4,
    name: "Chicken Momos (10 pcs)",
    restaurant: "Rudra Cafe",
    description: "Steamed dumplings filled with seasoned chicken",
    price: 180,
    category: "Momos",
    image: "https://images.unsplash.com/photo-1542666836-03522463be07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg"
  }
];
const categories = ["Offers", "Breakfast", "Salads", "Momos", "Laphing", "Pizza", "Healthy Options"];
function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const addToCart = (itemId) => {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    toast.success("Added to cart!");
  };
  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };
  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = mockMenuItems.reduce((sum, item) => {
    return sum + (cart[item.id] || 0) * item.price;
  }, 0);
  return /* @__PURE__ */ jsxs("div", { className: "bg-white min-h-screen", children: [
    /* @__PURE__ */ jsxs("section", { className: "relative h-[400px] bg-gray-200", children: [
      /* @__PURE__ */ jsx(
        ImageWithFallback,
        {
          src: "https://images.unsplash.com/photo-1613274554329-70f997f5789f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg",
          alt: "Restaurant",
          className: "w-full h-full object-cover"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 -mt-20 relative z-10", children: [
      /* @__PURE__ */ jsx("div", { className: "bg-white rounded-2xl shadow-xl p-8 mb-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-5xl font-bold mb-3", children: "Rudra Cafe" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full border-2 border-gray-300", children: [
              /* @__PURE__ */ jsx(Star, { className: "h-4 w-4 fill-[#FACC15] text-[#FACC15]" }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "4.1" })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-600", children: "Multi-Cuisine Restaurant" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-gray-600", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-[#CC4242]" }),
            /* @__PURE__ */ jsx("span", { children: "landmark 3800, ktm" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Button, { className: "bg-[#22C55E] hover:bg-[#16A34A] text-white", children: [
          /* @__PURE__ */ jsx(Clock, { className: "mr-2 h-4 w-4" }),
          "30-35 mins delivery"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("section", { className: "mb-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold mb-4", children: "Food Categories" }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-3 overflow-x-auto pb-2", children: ["Burgers", "Pizza", "Chinese"].map((cat) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "px-6 py-2 text-base whitespace-nowrap bg-gray-200 hover:bg-[#22C55E] hover:text-white cursor-pointer", children: cat }, cat)) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-12", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-semibold mb-6", children: "Top Picks" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx("div", { className: "aspect-square bg-gray-200 rounded-2xl" }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-12", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-semibold mb-6", children: "Offers" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx("div", { className: "aspect-square bg-gray-200 rounded-2xl" }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-[#878787] text-white py-4 px-6 rounded-t-2xl flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "bg-white/20 p-2 rounded-lg", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" }) }) }),
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold", children: "Menu" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative w-80", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "Search from menu",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "bg-white h-10 text-gray-900 pr-10"
              }
            ),
            /* @__PURE__ */ jsx(Search, { className: "absolute right-3 top-2.5 h-5 w-5 text-gray-400" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-white border-2 border-gray-200 p-4 flex gap-4 overflow-x-auto", children: categories.map((cat) => /* @__PURE__ */ jsx(
          "button",
          {
            className: "px-6 py-2 whitespace-nowrap font-semibold hover:text-[#22C55E] transition-colors",
            children: cat
          },
          cat
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-6", children: [
          /* @__PURE__ */ jsx("div", { className: "h-1 w-24 bg-[#6b6b6b] mb-8" }),
          mockMenuItems.map((item) => /* @__PURE__ */ jsx("div", { className: "bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-[#22C55E] transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4 p-5", children: [
            /* @__PURE__ */ jsx("div", { className: "w-40 h-40 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden", children: /* @__PURE__ */ jsx(
              ImageWithFallback,
              {
                src: item.image,
                alt: item.name,
                className: "w-full h-full object-cover"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-1", children: item.name }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-1", children: item.restaurant }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-sm text-gray-600 mb-2", children: [
                  /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3 text-[#CC4242]" }),
                  /* @__PURE__ */ jsx("span", { children: "xyz, xyz street" })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-700", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Description:" }),
                  " ",
                  item.description
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-3", children: [
                /* @__PURE__ */ jsxs("p", { className: "text-xl font-semibold", children: [
                  "Rs. ",
                  item.price
                ] }),
                cart[item.id] ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => removeFromCart(item.id),
                      className: "h-10 w-10 bg-[#808080] hover:bg-gray-700 rounded-full flex items-center justify-center text-white",
                      children: /* @__PURE__ */ jsx(Minus, { className: "h-5 w-5" })
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: cart[item.id] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => addToCart(item.id),
                      className: "h-10 w-10 bg-[#808080] hover:bg-gray-700 rounded-full flex items-center justify-center text-white",
                      children: /* @__PURE__ */ jsx(Plus, { className: "h-5 w-5" })
                    }
                  )
                ] }) : /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => addToCart(item.id),
                    className: "h-12 w-12 bg-[#808080] hover:bg-gray-700 rounded-full flex items-center justify-center text-white",
                    children: /* @__PURE__ */ jsx(Plus, { className: "h-6 w-6" })
                  }
                )
              ] })
            ] })
          ] }) }, item.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "my-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-semibold mb-6", children: "Ratings and Reviews" }),
        /* @__PURE__ */ jsx("div", { className: "bg-gray-200 h-96 rounded-2xl flex items-center justify-center text-gray-500", children: /* @__PURE__ */ jsx("p", { children: "Customer reviews will appear here" }) })
      ] })
    ] }),
    totalItems > 0 && /* @__PURE__ */ jsx("div", { className: "fixed bottom-8 right-8 z-50", children: /* @__PURE__ */ jsxs(
      Button,
      {
        size: "lg",
        className: "bg-[#F97316] hover:bg-[#EA580C] text-white shadow-2xl h-16 px-8 text-lg rounded-full",
        onClick: () => navigate("/checkout"),
        children: [
          /* @__PURE__ */ jsx(ShoppingCart, { className: "mr-3 h-6 w-6" }),
          "View Cart (",
          totalItems,
          ") \u2022 Rs. ",
          totalPrice
        ]
      }
    ) })
  ] });
}
export {
  RestaurantDetail
};
