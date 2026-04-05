import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "../shared/ui";
import { Input } from "../shared/ui";
import { Label } from "../shared/ui";
import { Separator } from "../shared/ui";
import { X, Clock } from "lucide-react";
import { toast } from "sonner";
const mockCart = [
  { id: 1, name: "Delicious Gourmet Burger", price: 443, quantity: 1, restaurant: "Rudra Cafe" }
];
function Checkout() {
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const subtotal = mockCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 90;
  const total = subtotal + shipping;
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    toast.success("Order placed successfully!");
    navigate("/order/1");
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-white", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-2 gap-8", children: [
    /* @__PURE__ */ jsx("div", { className: "space-y-8", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-5xl font-bold mb-8", children: "Delivery Details" }),
      /* @__PURE__ */ jsxs("section", { className: "mb-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold mb-4", children: "Order" }),
        mockCart.map((item) => /* @__PURE__ */ jsxs("div", { className: "bg-white border-2 border-black rounded-2xl p-4 flex gap-4 items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "w-32 h-32 bg-gray-300 rounded-xl flex-shrink-0" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg", children: item.name }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: item.restaurant }),
            /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold mt-2", children: [
              "Rs. ",
              item.price
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { className: "p-2 hover:bg-gray-100 rounded-full", children: /* @__PURE__ */ jsx(X, { className: "h-6 w-6" }) })
        ] }, item.id))
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold mb-2", children: "Restaurant Details" }),
        /* @__PURE__ */ jsx("p", { className: "text-xl", children: "Rudra Cafe" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "landmark 3800, ktm" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold mb-2", children: "Estimated Arrival" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[#F97316]", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-5 w-5" }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold", children: "30-35 minutes" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white border-2 border-gray-300 rounded-2xl overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-gray-300 border-b-2 border-gray-400 p-4", children: /* @__PURE__ */ jsxs("h3", { className: "text-xl font-medium text-center", children: [
          mockCart.length,
          " Item ordered"
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-lg", children: [
            /* @__PURE__ */ jsx("span", { children: "Subtotal" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Rs ",
              subtotal
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-lg", children: [
            /* @__PURE__ */ jsx("span", { children: "Shipping" }),
            /* @__PURE__ */ jsx("span", { children: shipping })
          ] }),
          /* @__PURE__ */ jsx(Separator, {}),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xl font-bold", children: [
            /* @__PURE__ */ jsx("span", { children: "Total" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Rs ",
              total
            ] })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold mb-6", children: "Confirm Your Details" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handlePlaceOrder, className: "space-y-5", children: [
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "Full Name",
            className: "bg-gray-100 h-14",
            defaultValue: "John Doe",
            disabled: true
          }
        ) }),
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "Email Address",
            className: "bg-gray-100 h-14",
            defaultValue: "john@example.com",
            disabled: true
          }
        ) }),
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "Contact Number",
            className: "bg-gray-100 h-14",
            defaultValue: "+977 9812345678",
            disabled: true
          }
        ) }),
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "Delivery Address",
            className: "bg-gray-100 h-14",
            defaultValue: "Kathmandu, Nepal",
            disabled: true
          }
        ) }),
        /* @__PURE__ */ jsx(Separator, { className: "my-6" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-lg mb-2 block", children: "Your Loyalty Coupons" }),
          /* @__PURE__ */ jsx("div", { className: "bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500", children: "No coupons available" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-lg mb-2 block", children: "Promo Codes" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              placeholder: "Enter promo code",
              value: promoCode,
              onChange: (e) => setPromoCode(e.target.value),
              className: "h-12"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pt-6", children: /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "w-full bg-[#F97316] hover:bg-[#EA580C] text-white h-16 text-2xl font-semibold",
            children: "Order Now"
          }
        ) })
      ] })
    ] })
  ] }) }) });
}
export {
  Checkout
};
