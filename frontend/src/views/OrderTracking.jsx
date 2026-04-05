import { jsx, jsxs } from "react/jsx-runtime";
import { useParams } from 'react-router-dom';
import { Button } from "../shared/ui";
import { Check, Package, Truck, MapPin, Clock } from "lucide-react";
const orderStatuses = [
  { id: 1, name: "Order Confirmed", icon: Check, completed: true },
  { id: 2, name: "Preparing", icon: Package, completed: true },
  { id: 3, name: "Out for Delivery", icon: Truck, completed: true },
  { id: 4, name: "Delivered", icon: MapPin, completed: false }
];
function OrderTracking() {
  const { id } = useParams();
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-white", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-12 max-w-4xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-5xl font-bold mb-4", children: "Track Your Order" }),
      /* @__PURE__ */ jsxs("p", { className: "text-xl text-gray-600", children: [
        "Order ID: #",
        id
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mb-12", children: /* @__PURE__ */ jsx("div", { className: "relative", children: orderStatuses.map((status, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 mb-8 last:mb-0 relative", children: [
      index !== orderStatuses.length - 1 && /* @__PURE__ */ jsx(
        "div",
        {
          className: `absolute left-6 top-14 w-1 h-16 ${status.completed ? "bg-[#22C55E]" : "bg-gray-300"}`
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: `w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${status.completed ? "bg-[#22C55E] text-white" : "bg-gray-200 text-gray-400"}`,
          children: /* @__PURE__ */ jsx(status.icon, { className: "h-6 w-6" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 pt-2", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-1", children: status.name }),
        status.completed && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Completed at 2:30 PM" })
      ] })
    ] }, status.id)) }) }),
    /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-[#22C55E]/10 to-[#22C55E]/5 rounded-2xl p-8 mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "h-16 w-16 bg-[#F97316]/20 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx(Clock, { className: "h-8 w-8 text-[#F97316]" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold", children: "Arriving Soon!" }),
          /* @__PURE__ */ jsx("p", { className: "text-lg text-gray-600", children: "Estimated delivery in 15 minutes" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Delivery Address" }),
          /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Kathmandu, Nepal" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Restaurant" }),
          /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Rudra Cafe" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border-2 border-gray-200 rounded-2xl p-6 mb-8", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-4", children: "Order Items" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { children: "Delicious Gourmet Burger \xD7 1" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Rs. 443" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm text-gray-600", children: [
          /* @__PURE__ */ jsx("span", { children: "Delivery Fee" }),
          /* @__PURE__ */ jsx("span", { children: "Rs. 90" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-px bg-gray-200 my-2" }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-lg font-bold", children: [
          /* @__PURE__ */ jsx("span", { children: "Total" }),
          /* @__PURE__ */ jsx("span", { className: "text-[#22C55E]", children: "Rs. 533" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", className: "flex-1", children: "Contact Support" }),
      /* @__PURE__ */ jsx(Button, { className: "flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white", children: "Call Delivery Partner" })
    ] })
  ] }) });
}
export {
  OrderTracking
};
