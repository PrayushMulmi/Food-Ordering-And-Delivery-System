import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "../shared/ui";
import { Textarea } from "../shared/ui";
import { Star } from "lucide-react";
import { toast } from "sonner";
const mockReviews = [
  {
    id: 1,
    restaurant: "Rudra Cafe",
    item: "Delicious Gourmet Burger",
    rating: 5,
    comment: "Amazing burger! Fresh ingredients and perfectly cooked. Will definitely order again!",
    date: "2026-03-18"
  },
  {
    id: 2,
    restaurant: "Pizza Palace",
    item: "Margherita Pizza",
    rating: 4,
    comment: "Great pizza, authentic Italian taste. Delivery was quick too.",
    date: "2026-03-15"
  }
];
function Reviews() {
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const handleSubmitReview = (e) => {
    e.preventDefault();
    toast.success("Review submitted successfully!");
    setNewRating(0);
    setComment("");
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-white", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-12", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-5xl font-bold mb-8", children: "Your Reviews" }),
    /* @__PURE__ */ jsx("section", { className: "mb-12", children: /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-br from-[#22C55E]/10 to-[#22C55E]/5 rounded-2xl p-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold mb-6", children: "Write a Review" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmitReview, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "Rating" }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setNewRating(star),
              onMouseEnter: () => setHoverRating(star),
              onMouseLeave: () => setHoverRating(0),
              className: "transition-transform hover:scale-125",
              children: /* @__PURE__ */ jsx(
                Star,
                {
                  className: `h-10 w-10 ${star <= (hoverRating || newRating) ? "fill-[#FACC15] text-[#FACC15]" : "text-gray-300"}`
                }
              )
            },
            star
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-2", children: "Your Review" }),
          /* @__PURE__ */ jsx(
            Textarea,
            {
              placeholder: "Share your experience with this restaurant...",
              value: comment,
              onChange: (e) => setComment(e.target.value),
              className: "min-h-32",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "bg-[#22C55E] hover:bg-[#16A34A] text-white",
            disabled: newRating === 0,
            children: "Submit Review"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold mb-6", children: "Your Past Reviews" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-6", children: mockReviews.map((review) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-white border-2 border-gray-200 rounded-2xl p-6",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold", children: review.restaurant }),
                /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: review.item })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsx(
                Star,
                {
                  className: `h-5 w-5 ${star <= review.rating ? "fill-[#FACC15] text-[#FACC15]" : "text-gray-300"}`
                },
                star
              )) })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-700 mb-3", children: review.comment }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: new Date(review.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric"
            }) })
          ]
        },
        review.id
      )) })
    ] })
  ] }) }) });
}
export {
  Reviews
};
