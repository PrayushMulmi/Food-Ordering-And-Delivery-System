import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge, Button, ImageWithFallback, Input } from '../shared/ui';
import { api, fileUrl } from '../lib/api';

function readFilters(params) {
  return {
    search: params.get('search') || '',
    cuisine: params.get('cuisine') || '',
    price_level: params.get('price_level') || '',
    location: params.get('location') || '',
    sort: params.get('sort') || 'top_rated',
    min_rating: params.get('min_rating') || '',
    open_now: params.get('open_now') || '',
  };
}

export function Restaurants() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [filters, setFilters] = useState(() => readFilters(searchParams));
  const [filterOptions, setFilterOptions] = useState({ cuisines: [], locations: [], price_levels: ['$', '$$', '$$$'] });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
    return params.toString();
  }, [filters]);

  useEffect(() => {
    const nextFilters = readFilters(searchParams);
    setFilters((current) => JSON.stringify(current) === JSON.stringify(nextFilters) ? current : nextFilters);
  }, [searchParams]);

  useEffect(() => {
    api.get('/api/restaurants/filters').then((res) => setFilterOptions(res.data || {})).catch(() => {});
  }, []);

  useEffect(() => {
    api.get(`/api/restaurants${queryString ? `?${queryString}` : ''}`).then((res) => setRestaurants(res.data || [])).catch(() => {});
    setSearchParams(queryString ? new URLSearchParams(queryString) : new URLSearchParams(), { replace: true });
  }, [queryString, setSearchParams]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold">Restaurants</h1>
          <p className="text-gray-600">Discover restaurants by category, quality, location, or matching menu items.</p>
        </div>
        <div className="rounded-2xl bg-[#f0fdf4] px-4 py-3 text-sm text-gray-700">Showing <span className="font-semibold">{restaurants.length}</span> restaurants</div>
      </div>
      <div className="mb-8 grid gap-4 rounded-3xl border bg-white p-5 lg:grid-cols-6">
        <Input placeholder="Search restaurants or menu items" value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={filters.cuisine} onChange={(e) => setFilters((p) => ({ ...p, cuisine: e.target.value }))}><option value="">All cuisines</option>{(filterOptions.cuisines || []).map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={filters.location} onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}><option value="">All locations</option>{(filterOptions.locations || []).map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={filters.price_level} onChange={(e) => setFilters((p) => ({ ...p, price_level: e.target.value }))}><option value="">All prices</option>{(filterOptions.price_levels || []).map((item) => <option key={item} value={item}>{item}</option>)}</select>
        <select className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={filters.sort} onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))}><option value="top_rated">Top rated</option><option value="fast_delivery">Fast delivery</option><option value="best_quality">Best quality</option><option value="newest">Newest</option><option value="name">Name</option></select>
        <label className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm"><input type="checkbox" checked={filters.open_now === '1'} onChange={(e) => setFilters((p) => ({ ...p, open_now: e.target.checked ? '1' : '' }))} /> Open now</label>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="overflow-hidden rounded-3xl border bg-white shadow-sm">
            <div className="h-48 bg-gray-100"><ImageWithFallback src={fileUrl(restaurant.cover_photo_url || restaurant.image_url)} alt={restaurant.name} className="h-full w-full object-cover" /></div>
            <div className="p-6">
              <div className="mb-3 flex items-start justify-between gap-3"><div><h2 className="text-xl font-semibold">{restaurant.name}</h2><p className="text-gray-600">{restaurant.cuisine}</p></div><Badge>{Number(restaurant.rating_average || 0).toFixed(1)}★</Badge></div>
              <p className="mb-4 line-clamp-2 text-sm text-gray-600">{restaurant.description || 'Fresh meals prepared daily.'}</p>
              <div className="mb-5 flex flex-wrap gap-2 text-sm text-gray-500"><span>{restaurant.address}</span><span>•</span><span>{restaurant.price_level}</span><span>•</span><span>{restaurant.is_open ? 'Open' : 'Closed'}</span></div>
              <Button asChild className="w-full"><Link to={`/restaurant/${restaurant.id}`}>View menu</Link></Button>
            </div>
          </div>
        ))}
      </div>
      {!restaurants.length && (
        <div className="mt-8 rounded-3xl border bg-white p-8 text-center text-gray-600 shadow-sm">
          No restaurants matched your current search or filters.
        </div>
      )}
    </div>
  );
}
