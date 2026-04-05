import { jsx, jsxs } from "react/jsx-runtime";
import { useRef } from "react";
import { Link } from 'react-router-dom';
import { ImageWithFallback } from "../shared/ui";
import { Button } from "../shared/ui";
import { Badge } from "../shared/ui";
import { Star, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
const restaurantsByTag = {
  "Popular Choices": [
    {
      id: 1,
      name: "Rudra Cafe",
      cuisine: "Multi-Cuisine",
      rating: 4.5,
      deliveryTime: "30-35 min",
      location: "Downtown, Street 3",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1632898657953-f41f81bfa892?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBkZWxpY2lvdXMlMjBnb3VybWV0fGVufDF8fHx8MTc3NDAxODg0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
      discount: "20% OFF"
    },
    {
      id: 2,
      name: "Pizza Palace",
      cuisine: "Italian, Pizza",
      rating: 4.7,
      deliveryTime: "25-30 min",
      location: "Main Street, Block A",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1724232865752-4af928d13989?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMGl0YWxpYW4lMjByZXN0YXVyYW50fGVufDF8fHx8MTc3MzkxODEzN3ww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: 3,
      name: "Noodle House",
      cuisine: "Asian, Chinese",
      rating: 4.3,
      deliveryTime: "35-40 min",
      location: "Chinatown, Plaza 2",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1542666836-03522463be07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMG5vb2RsZXMlMjByZXN0YXVyYW50JTIwY3Vpc2luZXxlbnwxfHx8fDE3NzQwMTg4NTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
      discount: "Free Delivery"
    },
    {
      id: 4,
      name: "Sushi Express",
      cuisine: "Japanese, Sushi",
      rating: 4.8,
      deliveryTime: "20-25 min",
      location: "City Center, Level 3",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1700324822763-956100f79b0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMGphcGFuZXNlJTIwZm9vZHxlbnwxfHx8fDE3NzM5ODE4NzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      discount: "30% OFF"
    },
    {
      id: 5,
      name: "Taco Fiesta",
      cuisine: "Mexican, Tacos",
      rating: 4.6,
      deliveryTime: "30-35 min",
      location: "Market Square, Row 5",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwdGFjb3MlMjByZXN0YXVyYW50fGVufDF8fHx8MTc3NDAxODg2MXww&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ],
  "Best Deals": [
    {
      id: 6,
      name: "Burger Barn",
      cuisine: "American, Burgers",
      rating: 4.4,
      deliveryTime: "25-30 min",
      location: "West End, Avenue 7",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjByZXN0YXVyYW50fGVufDF8fHx8MTc3NDAxODg2N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      discount: "40% OFF"
    },
    {
      id: 7,
      name: "Pasta Paradise",
      cuisine: "Italian, Pasta",
      rating: 4.5,
      deliveryTime: "30-35 min",
      location: "Little Italy, Street 12",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGl0YWxpYW4lMjByZXN0YXVyYW50fGVufDF8fHx8MTc3NDAxODg3M3ww&ixlib=rb-4.1.0&q=80&w=1080",
      discount: "25% OFF"
    },
    {
      id: 8,
      name: "Curry Kingdom",
      cuisine: "Indian, Curry",
      rating: 4.7,
      deliveryTime: "35-40 min",
      location: "Spice District, Lane 4",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBjdXJyeSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzc0MDE4ODc5fDA&ixlib=rb-4.1.0&q=80&w=1080",
      discount: "35% OFF + Free Delivery"
    },
    {
      id: 9,
      name: "Ramen Republic",
      cuisine: "Japanese, Ramen",
      rating: 4.6,
      deliveryTime: "25-30 min",
      location: "Downtown, Plaza 8",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYW1lbiUyMGphcGFuZXNlJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3NzQwMTg4ODV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      discount: "20% OFF"
    },
    {
      id: 10,
      name: "Waffle Wonderland",
      cuisine: "Desserts, Breakfast",
      rating: 4.3,
      deliveryTime: "20-25 min",
      location: "City Center, Floor 2",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1568051243851-f9b136146e97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YWZmbGVzJTIwZGVzc2VydCUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzc0MDE4ODkwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      discount: "Buy 1 Get 1"
    }
  ],
  "Best Quality": [
    {
      id: 11,
      name: "The Gourmet Kitchen",
      cuisine: "Fine Dining, Multi-Cuisine",
      rating: 4.9,
      deliveryTime: "40-45 min",
      location: "Premium District, Tower A",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwZmluZSUyMGRpbmluZyUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzc0MDE4ODk2fDA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: 12,
      name: "Seafood Symphony",
      cuisine: "Seafood, Mediterranean",
      rating: 4.8,
      deliveryTime: "35-40 min",
      location: "Waterfront, Pier 9",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZWFmb29kJTIwcmVzdGF1cmFudCUyMG1lZGl0ZXJyYW5lYW58ZW58MXx8fHwxNzc0MDE4OTAxfDA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: 13,
      name: "Steakhouse Supreme",
      cuisine: "American, Steaks",
      rating: 4.9,
      deliveryTime: "45-50 min",
      location: "Business District, Level 5",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVhayUyMHJlc3RhdXJhbnQlMjBnb3VybWV0fGVufDF8fHx8MTc3NDAxODkwN3ww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: 14,
      name: "Organic Harvest",
      cuisine: "Healthy, Organic",
      rating: 4.7,
      deliveryTime: "30-35 min",
      location: "Green Valley, Street 15",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwb3JnYW5pYyUyMGZvb2QlMjByZXN0YXVyYW50fGVufDF8fHx8MTc3NDAxODkxMnww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: 15,
      name: "French Bistro",
      cuisine: "French, European",
      rating: 4.8,
      deliveryTime: "40-45 min",
      location: "Arts Quarter, Boulevard 3",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBiaXN0cm8lMjByZXN0YXVyYW50fGVufDF8fHx8MTc3NDAxODkxOHww&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ],
  "Fast Delivery": [
    {
      id: 16,
      name: "Quick Bites Express",
      cuisine: "Fast Food, Sandwiches",
      rating: 4.2,
      deliveryTime: "15-20 min",
      location: "University Area, Street 6",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW5kd2ljaCUyMGZhc3QlMjBmb29kfGVufDF8fHx8MTc3NDAxODkyNHww&ixlib=rb-4.1.0&q=80&w=1080",
      discount: "Free Delivery"
    },
    {
      id: 17,
      name: "Bowl & Roll",
      cuisine: "Asian, Bowls",
      rating: 4.4,
      deliveryTime: "18-22 min",
      location: "Tech Park, Building C",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGJvd2wlMjBmb29kfGVufDF8fHx8MTc3NDAxODkzMHww&ixlib=rb-4.1.0&q=80&w=1080",
      discount: "15% OFF"
    },
    {
      id: 18,
      name: "Smoothie Station",
      cuisine: "Beverages, Healthy",
      rating: 4.5,
      deliveryTime: "12-15 min",
      location: "Gym District, Corner 2",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbW9vdGhpZSUyMGJldmVyYWdlJTIwaGVhbHRoeXxlbnwxfHx8fDE3NzQwMTg5MzV8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: 19,
      name: "Wrap Master",
      cuisine: "Mediterranean, Wraps",
      rating: 4.3,
      deliveryTime: "16-20 min",
      location: "Shopping Mall, Food Court",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3cmFwJTIwbWVkaXRlcnJhbmVhbiUyMGZvb2R8ZW58MXx8fHwxNzc0MDE4OTQxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      discount: "10% OFF"
    },
    {
      id: 20,
      name: "Coffee & Cake Co.",
      cuisine: "Cafe, Desserts",
      rating: 4.6,
      deliveryTime: "10-15 min",
      location: "High Street, Corner Shop",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBjYWtlJTIwY2FmZXxlbnwxfHx8fDE3NzQwMTg5NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ],
  "New Arrivals": [
    {
      id: 21,
      name: "Poke Bowl Paradise",
      cuisine: "Hawaiian, Healthy",
      rating: 4.5,
      deliveryTime: "25-30 min",
      location: "Beach Road, Unit 12",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2tlJTIwYm93bCUyMGhhd2FpaWFufGVufDF8fHx8MTc3NDAxODk1MXww&ixlib=rb-4.1.0&q=80&w=1080",
      discount: "Grand Opening: 25% OFF"
    },
    {
      id: 22,
      name: "BBQ Brothers",
      cuisine: "American, BBQ",
      rating: 4.4,
      deliveryTime: "35-40 min",
      location: "Riverside, Dock 7",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYnElMjBhbWVyaWNhbiUyMGZvb2R8ZW58MXx8fHwxNzc0MDE4OTU2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      discount: "New: Free Side Dish"
    },
    {
      id: 23,
      name: "Vegan Delights",
      cuisine: "Vegan, Healthy",
      rating: 4.7,
      deliveryTime: "30-35 min",
      location: "Eco Street, Building 4",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1540914124281-342587941389?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdhbiUyMGhlYWx0aHklMjBmb29kfGVufDF8fHx8MTc3NDAxODk2MXww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: 24,
      name: "Dumpling Dynasty",
      cuisine: "Chinese, Dumplings",
      rating: 4.6,
      deliveryTime: "25-30 min",
      location: "Chinatown, Lane 8",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkdW1wbGluZ3MlMjBjaGluZXNlfGVufDF8fHx8MTc3NDAxODk2N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      discount: "Opening Week: 30% OFF"
    },
    {
      id: 25,
      name: "Gelato Gallery",
      cuisine: "Desserts, Italian",
      rating: 4.8,
      deliveryTime: "20-25 min",
      location: "Arts District, Street 11",
      isOpen: true,
      image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZWxhdG8lMjBpY2UlMjBjcmVhbXxlbnwxfHx8fDE3NzQwMTg5NzN8MA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ]
};
function ScrollButtons({ scrollRef }) {
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
    /* @__PURE__ */ jsx(
      Button,
      {
        variant: "outline",
        size: "icon",
        onClick: () => scroll("left"),
        className: "h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#22C55E] hover:bg-[#22C55E] hover:text-white",
        children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" })
      }
    ),
    /* @__PURE__ */ jsx(
      Button,
      {
        variant: "outline",
        size: "icon",
        onClick: () => scroll("right"),
        className: "h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#22C55E] hover:bg-[#22C55E] hover:text-white",
        children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5" })
      }
    )
  ] });
}
function RestaurantCard({ restaurant }) {
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to: `/restaurant/${restaurant.id}`,
      className: "group flex-shrink-0 w-80 bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:border-[#22C55E]",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "aspect-video bg-gray-200 relative overflow-hidden", children: [
          /* @__PURE__ */ jsx(
            ImageWithFallback,
            {
              src: restaurant.image,
              alt: restaurant.name,
              className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            }
          ),
          restaurant.discount && /* @__PURE__ */ jsx(Badge, { className: "absolute top-4 right-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold px-3 py-1", children: restaurant.discount })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between mb-2", children: /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold group-hover:text-[#22C55E] transition-colors line-clamp-1", children: restaurant.name }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full border-2 border-gray-300", children: [
              /* @__PURE__ */ jsx(Star, { className: "h-4 w-4 fill-[#FACC15] text-[#FACC15]" }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm", children: restaurant.rating })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-sm line-clamp-1", children: restaurant.cuisine })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm text-gray-600", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 line-clamp-1", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-[#CC4242] flex-shrink-0" }),
              /* @__PURE__ */ jsx("span", { className: "line-clamp-1", children: restaurant.location })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-[#F97316] font-semibold flex-shrink-0 ml-2", children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { children: restaurant.deliveryTime })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: `py-3 text-center font-bold ${restaurant.isOpen ? "bg-[#717171]" : "bg-gray-400"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: `h-3 w-3 rounded-full ${restaurant.isOpen ? "bg-[#55C95E]" : "bg-red-500"}` }),
          /* @__PURE__ */ jsx("span", { className: "text-white", children: restaurant.isOpen ? "Open" : "Closed" })
        ] }) })
      ]
    }
  );
}
function Restaurants() {
  const scrollRefs = {
    "Popular Choices": useRef(null),
    "Best Deals": useRef(null),
    "Best Quality": useRef(null),
    "Fast Delivery": useRef(null),
    "New Arrivals": useRef(null)
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white min-h-screen", children: [
    /* @__PURE__ */ jsx("section", { className: "bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-16", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-5xl md:text-6xl font-bold mb-4", children: "Find Restaurants" }),
      /* @__PURE__ */ jsx("p", { className: "text-xl md:text-2xl text-white/90", children: "Discover amazing restaurants near you" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-12 space-y-16", children: Object.entries(restaurantsByTag).map(([tag, restaurants]) => /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold", children: tag }),
        /* @__PURE__ */ jsx(ScrollButtons, { scrollRef: scrollRefs[tag] })
      ] }),
      /* @__PURE__ */ jsx(
        "div",
        {
          ref: scrollRefs[tag],
          className: "flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth",
          style: {
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          },
          children: restaurants.map((restaurant) => /* @__PURE__ */ jsx(RestaurantCard, { restaurant }, restaurant.id))
        }
      )
    ] }, tag)) })
  ] });
}
export {
  Restaurants
};
