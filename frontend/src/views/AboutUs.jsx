import { Link } from 'react-router-dom';
import { Button } from '../shared/ui';
import { Clock, MapPin, ShieldCheck, Utensils } from 'lucide-react';

const highlights = [
  { title: 'Verified restaurants', description: 'Browse active restaurants, clear pricing levels, menus, ratings, and availability before you order.', icon: ShieldCheck },
  { title: 'Fresh local delivery', description: 'Order meals from restaurants across Kathmandu, Lalitpur, and Bhaktapur with a simple checkout flow.', icon: Utensils },
  { title: 'Live order updates', description: 'Track your order status from confirmation to delivery and access your order history anytime.', icon: Clock },
];

export function AboutUs() {
  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-[#22C55E]/10 via-white to-[#F97316]/5">
        <div className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#16A34A]">About Annaya</p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">A simple food ordering and delivery system for customers and restaurants.</h1>
            <p className="mt-5 max-w-2xl text-lg text-gray-600">Annaya connects customers with local restaurants through a clean ordering experience, basket management, secure accounts, order tracking, customer notes, and professional billing.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild><Link to="/restaurants">Browse restaurants</Link></Button>
              <Button variant="outline" asChild><Link to="/faqs">Read FAQs</Link></Button>
            </div>
          </div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <MapPin className="mb-4 h-10 w-10 text-[#22C55E]" />
            <h2 className="text-2xl font-semibold">Serving local food lovers</h2>
            <p className="mt-3 text-gray-600">The platform is designed around customer-friendly navigation, restaurant availability, transparent bills, and secure role-based access for customers, restaurant admins, riders, and platform administrators.</p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map(({ title, description, icon: Icon }) => (
            <div key={title} className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#22C55E]/10 text-[#16A34A]"><Icon className="h-6 w-6" /></div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
