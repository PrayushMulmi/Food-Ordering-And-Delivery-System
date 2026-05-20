import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { api } from "../../lib/api";

export function AdminRatings() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get('/api/restaurant-admin/reviews').then((res) => setReviews(res.data || [])).catch(() => {});
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Ratings & Reviews</h1>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold">{review.customer_name}</h3>
                <p className="text-sm text-gray-500">{review.menu_item_name}</p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className={`h-5 w-5 ${i < review.rating ? 'fill-[#FACC15] text-[#FACC15]' : 'text-gray-300'}`} />)}
              </div>
            </div>
            <p className="mt-3 text-gray-700">{review.comment || 'No written comment.'}</p>
          </div>
        ))}
        {!reviews.length && <div className="bg-white rounded-lg border p-8 text-center text-gray-600">No reviews found.</div>}
      </div>
    </div>
  );
}
//