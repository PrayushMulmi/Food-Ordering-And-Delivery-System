// v2 update
import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Badge } from "../../shared/ui";
import { Button } from "../../shared/ui";
import { ImageWithFallback } from "../../shared/ui";

const mockReviews = [
  {
    id: 1,
    customerName: "John Doe",
    rating: 5,
    comment: "Amazing food and excellent service! The pizza was perfectly cooked and arrived hot. Will definitely order again.",
    date: "March 23, 2026",
    orderItems: "Margherita Pizza, Caesar Salad",
    helpful: 12,
    image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    customerName: "Sarah Smith",
    rating: 4,
    comment: "Really good food but delivery took a bit longer than expected. Still satisfied overall!",
    date: "March 22, 2026",
    orderItems: "Chicken Burger, Fries",
    helpful: 8,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: 3,
    customerName: "Mike Johnson",
    rating: 5,
    comment: "Absolutely delicious! Best pasta I've had in a long time. Portion sizes are generous too.",
    date: "March 22, 2026",
    orderItems: "Pasta Carbonara, Garlic Bread",
    helpful: 15,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: 4,
    customerName: "Emily Brown",
    rating: 3,
    comment: "Food was okay but not exceptional. Expected better quality for the price.",
    date: "March 21, 2026",
    orderItems: "Sushi Platter",
    helpful: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    id: 5,
    customerName: "David Wilson",
    rating: 5,
    comment: "Excellent! Everything was perfect from ordering to delivery. Highly recommend!",
    date: "March 20, 2026",
    orderItems: "Chicken Tikka, Naan Bread",
    helpful: 20,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
  {
    id: 6,
    customerName: "Lisa Anderson",
    rating: 4,
    comment: "Great taste and good packaging. Would love to see more vegan options on the menu.",
    date: "March 19, 2026",
    orderItems: "Vegan Bowl",
    helpful: 9,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
  },
];

const ratingDistribution = [
  { stars: 5, count: 456, percentage: 72 },
  { stars: 4, count: 125, percentage: 20 },
  { stars: 3, count: 32, percentage: 5 },
  { stars: 2, count: 15, percentage: 2 },
  { stars: 1, count: 6, percentage: 1 },
];

export function AdminRatings() {
  const [filterRating, setFilterRating] = useState("all");

  const filteredReviews =
    filterRating === "all"
      ? mockReviews
      : mockReviews.filter((review) => review.rating === Number(filterRating));

  const avgRating = 4.5;
  const totalReviews = 634;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Customer Ratings & Reviews</h1>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Overall Rating Summary */}
        <div className="lg:col-span-1 bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-lg p-8 text-white shadow-lg">
          <div className="text-center">
            <p className="text-lg mb-2 opacity-90">Average Rating</p>
            <div className="text-6xl font-bold mb-4">{avgRating}</div>
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.floor(avgRating) ? "fill-[#FACC15] text-[#FACC15]" : "text-white/40"
                  }`}
                />
              ))}
            </div>
            <p className="text-lg opacity-90">Based on {totalReviews} reviews</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="lg:col-span-2 bg-white border-2 border-gray-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Rating Distribution</h2>
          <div className="space-y-4">
            {ratingDistribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-20">
                  <span className="font-semibold">{dist.stars}</span>
                  <Star className="h-4 w-4 fill-[#FACC15] text-[#FACC15]" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-[#FACC15] h-full rounded-full transition-all"
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
                <div className="w-20 text-right">
                  <span className="font-semibold">{dist.count}</span>
                  <span className="text-gray-600 ml-1">({dist.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-lg">Filter by rating:</span>
          <div className="flex gap-2">
            <Button
              variant={filterRating === "all" ? "default" : "outline"}
              onClick={() => setFilterRating("all")}
              className={
                filterRating === "all"
                  ? "bg-[#22C55E] hover:bg-[#16A34A]"
                  : ""
              }
            >
              All
            </Button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={filterRating === rating.toString() ? "default" : "outline"}
                onClick={() => setFilterRating(rating.toString())}
                className={
                  filterRating === rating.toString()
                    ? "bg-[#22C55E] hover:bg-[#16A34A]"
                    : ""
                }
              >
                {rating} <Star className="h-4 w-4 ml-1 fill-current" />
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-[#22C55E] transition-colors"
          >
            <div className="flex gap-6">
              {/* Customer Avatar */}
              <ImageWithFallback
                src={review.image}
                alt={review.customerName}
                className="w-16 h-16 rounded-full object-cover"
              />

              <div className="flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold">{review.customerName}</h3>
                    <p className="text-sm text-gray-600">{review.date}</p>
                  </div>
                  <Badge
                    className={`${
                      review.rating >= 4
                        ? "bg-[#22C55E]"
                        : review.rating === 3
                        ? "bg-[#FACC15] text-black"
                        : "bg-[#F97316]"
                    } text-white`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{review.rating}</span>
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </Badge>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < review.rating
                          ? "fill-[#FACC15] text-[#FACC15]"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Order Items */}
                <p className="text-sm text-gray-600 mb-3">
                  <MessageSquare className="inline h-4 w-4 mr-1" />
                  Ordered: {review.orderItems}
                </p>

                {/* Comment */}
                <p className="text-gray-800 mb-4">{review.comment}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 text-sm">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-[#22C55E] transition-colors">
                    <ThumbsUp className="h-4 w-4" />
                    <span>Helpful ({review.helpful})</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
                    <ThumbsDown className="h-4 w-4" />
                    <span>Not Helpful</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No reviews found for the selected rating.
        </div>
      )}
    </div>
  );
}
