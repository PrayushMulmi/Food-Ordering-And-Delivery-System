import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Button } from "../shared/ui";
import { Badge } from "../shared/ui";
import { Clock, Star, Package, RotateCcw } from "lucide-react";
const mockOrders = [
  {
    id: 1,
    restaurant: "Rudra Cafe",
    items: ["Delicious Gourmet Burger", "French Fries"],
    total: 533,
    date: "2026-03-18",
    status: "Delivered",
    statusColor: "bg-[#22C55E]"
  },
  {
    id: 2,
    restaurant: "Pizza Palace",
    items: ["Margherita Pizza", "Garlic Bread"],
    total: 780,
    date: "2026-03-15",
    status: "Delivered",
    statusColor: "bg-[#22C55E]"
  },
  {
    id: 3,
    restaurant: "Noodle House",
    items: ["Chicken Chow Mein"],
    total: 320,
    date: "2026-03-12",
    status: "Cancelled",
    statusColor: "bg-gray-500"
  }
];
function OrderHistory() {
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-white", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-12", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-5xl font-bold mb-8", children: "Order History" }),
    /* @__PURE__ */ jsxs("section", { className: "mb-12", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-semibold mb-6 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Package, { className: "h-6 w-6 text-[#F97316]" }),
        "Active Orders"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-[#22C55E]/10 to-[#F97316]/10 rounded-2xl p-8 text-center", children: [
        /* @__PURE__ */ jsx(Clock, { className: "h-16 w-16 text-gray-400 mx-auto mb-4" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-gray-600", children: "No active orders" }),
        /* @__PURE__ */ jsx(Button, { className: "mt-4 bg-[#22C55E] hover:bg-[#16A34A]", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/dashboard", children: "Browse Restaurants" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold mb-6", children: "Past Orders" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-4", children: mockOrders.map((order) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-[#22C55E] transition-colors",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4 mb-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-2xl font-semibold", children: order.restaurant }),
                  /* @__PURE__ */ jsx(Badge, { className: `${order.statusColor} text-white`, children: order.status })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-gray-600 mb-1", children: order.items.join(", ") }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: new Date(order.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                }) })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxs("p", { className: "text-3xl font-bold text-[#22C55E]", children: [
                "Rs. ",
                order.total
              ] }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 pt-4 border-t border-gray-200", children: [
              /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: `/order/${order.id}`, children: [
                /* @__PURE__ */ jsx(Clock, { className: "mr-2 h-4 w-4" }),
                "Track Order"
              ] }) }),
              order.status === "Delivered" && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", children: [
                  /* @__PURE__ */ jsx(RotateCcw, { className: "mr-2 h-4 w-4" }),
                  "Reorder"
                ] }),
                /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/reviews", children: [
                  /* @__PURE__ */ jsx(Star, { className: "mr-2 h-4 w-4" }),
                  "Write Review"
                ] }) })
              ] }),
              /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", children: "View Receipt" })
            ] })
          ]
        },
        order.id
      )) })
    ] })
  ] }) }) });
}
export {
  OrderHistory
};
