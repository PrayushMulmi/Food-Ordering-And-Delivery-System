import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ImageWithFallback, Button } from "../shared/ui";
import { ArrowRight, Clock, Search, Star, Shield } from "lucide-react";
import { api, fileUrl } from '../lib/api';

function RestaurantRow({ title, items, viewMore }) {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-3xl font-bold">{title}</h2>
          <Link to={viewMore} className="text-sm font-semibold text-[#22C55E] hover:underline">View More</Link>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-3">
          {items.map((restaurant) => (
            <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`} className="min-w-[280px] max-w-[280px] rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1">
              <div className="h-40 overflow-hidden rounded-t-2xl bg-gray-100">
                <ImageWithFallback src={fileUrl(restaurant.cover_photo_url || restaurant.image_url)} alt={restaurant.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-start justify-between gap-3"><h3 className="text-lg font-bold">{restaurant.name}</h3><span className="rounded-full bg-[#22C55E] px-2 py-1 text-xs font-semibold text-white">{Number(restaurant.rating_average || 0).toFixed(1)}★</span></div>
                <p className="text-sm text-gray-600">{restaurant.cuisine} • {restaurant.address}</p>
                <p className="mt-3 line-clamp-2 text-sm text-gray-500">{restaurant.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  const [sections, setSections] = useState({ highestRated: [], fastDelivery: [], bestQuality: [] });
  const [stats, setStats] = useState({ total: 0, rating: 0 });

  useEffect(() => {
    Promise.all([api.get('/api/restaurants/sections'), api.get('/api/restaurants?sort=top_rated')]).then(([s, r]) => {
      setSections(s.data || { highestRated: [], fastDelivery: [], bestQuality: [] });
      const items = r.data || [];
      const avg = items.length ? items.reduce((sum, item) => sum + Number(item.rating_average || 0), 0) / items.length : 0;
      setStats({ total: items.length, rating: avg.toFixed(1) });
    }).catch(() => {});
  }, []);

  return (
    <div className="relative">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#22C55E]/10 via-white to-[#F97316]/5">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FACC15]/20 px-4 py-2"><Star className="h-4 w-4 fill-[#FACC15] text-[#FACC15]" /><span className="text-sm font-medium">Rated #1 Food Delivery App</span></div>
              <h1 className="text-5xl font-bold leading-tight md:text-7xl">Food at your <span className="text-[#22C55E]">doorstep</span></h1>
              <p className="text-xl text-gray-600">Order from your favorite restaurants and get it delivered fresh, fast, and with premium quality.</p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="h-14 bg-[#22C55E] px-8 text-lg text-white hover:bg-[#16A34A]" asChild><Link to="/signup">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
                <Button size="lg" variant="outline" className="h-14 border-2 border-[#22C55E] px-8 text-lg text-[#22C55E] hover:bg-[#22C55E]/10" asChild><Link to="/login">Log in</Link></Button>
              </div>
            </div>
            <div className="relative"><div className="aspect-square overflow-hidden rounded-3xl shadow-2xl"><ImageWithFallback src="https://images.unsplash.com/photo-1769638913684-87c75872fda7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Fresh food" className="h-full w-full object-cover" /></div><div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F97316]/20"><Clock className="h-6 w-6 text-[#F97316]" /></div><div><p className="text-2xl font-bold text-[#F97316]">30 min</p><p className="text-sm text-gray-600">Average delivery</p></div></div></div></div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20"><div className="container mx-auto px-4"><div className="mb-16 text-center"><h2 className="mb-4 text-4xl font-bold md:text-5xl">Why us?</h2><p className="mx-auto max-w-2xl text-xl text-gray-600">We deliver more than just food. We deliver an experience.</p></div><div className="grid gap-8 md:grid-cols-3"><div className="group rounded-2xl bg-gradient-to-br from-[#22C55E]/5 to-[#22C55E]/10 p-8 transition-all duration-300 hover:shadow-xl"><div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#22C55E]/20 transition-transform group-hover:scale-110"><Search className="h-8 w-8 text-[#22C55E]" /></div><h3 className="mb-3 text-2xl font-bold">Easy Tracking</h3><p className="text-gray-600">Track your order in real-time from restaurant to your doorstep with our intuitive tracking system.</p></div><div className="group rounded-2xl bg-gradient-to-br from-[#F97316]/5 to-[#F97316]/10 p-8 transition-all duration-300 hover:shadow-xl"><div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F97316]/20 transition-transform group-hover:scale-110"><Clock className="h-8 w-8 text-[#F97316]" /></div><h3 className="mb-3 text-2xl font-bold">Instant Delivery</h3><p className="text-gray-600">Get your food delivered fast with our optimized delivery network.</p></div><div className="group rounded-2xl bg-gradient-to-br from-[#FACC15]/5 to-[#FACC15]/10 p-8 transition-all duration-300 hover:shadow-xl"><div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FACC15]/20 transition-transform group-hover:scale-110"><Shield className="h-8 w-8 text-[#EAB308]" /></div><h3 className="mb-3 text-2xl font-bold">Variety & Quality</h3><p className="text-gray-600">Choose from verified restaurants and cuisines with quality you can trust.</p></div></div></div></section>

      <section className="bg-[#22C55E] py-16 text-white"><div className="container mx-auto px-4"><div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4"><div><p className="mb-2 text-5xl font-bold">{stats.total}+</p><p className="text-lg opacity-90">Restaurants</p></div><div><p className="mb-2 text-5xl font-bold">10k+</p><p className="text-lg opacity-90">Happy Customers</p></div><div><p className="mb-2 text-5xl font-bold">50k+</p><p className="text-lg opacity-90">Orders Delivered</p></div><div><p className="mb-2 text-5xl font-bold">{stats.rating || '4.8'}⭐</p><p className="text-lg opacity-90">Average Rating</p></div></div></div></section>

      <RestaurantRow title="Highest Rated" items={sections.highestRated} viewMore="/restaurants?sort=top_rated" />
      <RestaurantRow title="Fast Delivery" items={sections.fastDelivery} viewMore="/restaurants?sort=fast_delivery&open_now=1" />
      <RestaurantRow title="Best Quality" items={sections.bestQuality} viewMore="/restaurants?sort=best_quality&min_rating=4" />

      <section className="bg-gray-50 py-20"><div className="container mx-auto px-4"><h2 className="mb-16 text-center text-4xl font-bold md:text-5xl">Partner with Us</h2><div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2"><div className="rounded-2xl bg-white p-8 shadow-lg transition-shadow hover:shadow-xl"><div className="mb-6 aspect-video overflow-hidden rounded-xl bg-gray-200"><ImageWithFallback src="https://images.unsplash.com/photo-1761303506087-9788d0a98e87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Restaurant" className="h-full w-full object-cover" /></div><h3 className="mb-3 text-2xl font-bold">Create Your Restaurant Account</h3><p className="mb-6 text-gray-600">Join our platform and reach thousands of hungry customers. Manage your menu, orders, and grow your business.</p><Button className="w-full bg-[#F97316] text-white hover:bg-[#EA580C]" asChild><Link to="/admin?mode=register">Register Your Restaurant</Link></Button></div><div className="rounded-2xl bg-white p-8 shadow-lg transition-shadow hover:shadow-xl"><div className="mb-6 aspect-video overflow-hidden rounded-xl bg-gray-200"><ImageWithFallback src="https://images.unsplash.com/photo-1758956934245-8daff43eb1e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" alt="Delivery" className="h-full w-full object-cover" /></div><h3 className="mb-3 text-2xl font-bold">Start Your Food Ordering Journey</h3><p className="mb-6 text-gray-600">Browse from hundreds of restaurants, track your orders in real-time, and enjoy fast delivery to your doorstep.</p><Button className="w-full bg-[#22C55E] text-white hover:bg-[#16A34A]" asChild><Link to="/signup">Get Started</Link></Button></div></div></div></section>
    </div>
  );
}
