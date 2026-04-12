import { useEffect, useState } from 'react';
import { Badge, Button, Textarea } from '../shared/ui';
import { api } from '../lib/api';
import { toast } from 'sonner';

export function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [reviewable, setReviewable] = useState([]);
  const [drafts, setDrafts] = useState({});

  const loadData = async () => {
    const [mine, eligible] = await Promise.all([
      api.get('/api/reviews/mine'),
      api.get('/api/reviews/reviewable'),
    ]);
    setReviews(mine.data || []);
    setReviewable((eligible.data || []).filter((item) => !Number(item.already_reviewed)));
  };

  useEffect(() => { loadData().catch(() => {}); }, []);

  const submitReview = async (item) => {
    const draft = drafts[item.order_id + '-' + item.menu_item_id] || { rating: 5, comment: '' };
    try {
      await api.post('/api/reviews', { order_id: item.order_id, menu_item_id: item.menu_item_id, rating: Number(draft.rating || 5), comment: draft.comment || '' });
      toast.success('Review submitted');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Could not submit review');
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      <section>
        <h1 className="mb-6 text-4xl font-bold">Your reviews</h1>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{review.restaurant_name}</h2>
                  <p className="text-sm text-gray-500">{review.menu_item_name} • Order #{review.order_code}</p>
                </div>
                <Badge>{review.rating}/5</Badge>
              </div>
              <p className="mt-4 text-gray-700">{review.comment || 'No comment provided.'}</p>
            </div>
          ))}
          {!reviews.length && <div className="rounded-3xl border bg-white p-10 text-center text-gray-600">You have not submitted any reviews yet.</div>}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-3xl font-bold">Eligible delivered items</h2>
        <div className="space-y-4">
          {reviewable.map((item) => {
            const key = item.order_id + '-' + item.menu_item_id;
            const draft = drafts[key] || { rating: 5, comment: '' };
            return (
              <div key={key} className="rounded-3xl border bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{item.restaurant_name}</h3>
                    <p className="text-sm text-gray-500">{item.item_name} • Order #{item.order_code}</p>
                  </div>
                  <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={draft.rating} onChange={(e) => setDrafts((p) => ({ ...p, [key]: { ...draft, rating: e.target.value } }))}>
                    {[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating} star</option>)}
                  </select>
                </div>
                <Textarea className="mt-4" placeholder="Write your review" value={draft.comment} onChange={(e) => setDrafts((p) => ({ ...p, [key]: { ...draft, comment: e.target.value } }))} />
                <Button className="mt-4" onClick={() => submitReview(item)}>Submit review</Button>
              </div>
            );
          })}
          {!reviewable.length && <div className="rounded-3xl border bg-white p-10 text-center text-gray-600">No delivered items are waiting for your review.</div>}
        </div>
      </section>
    </div>
  );
}
