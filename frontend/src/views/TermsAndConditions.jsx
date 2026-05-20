import { Link } from 'react-router-dom';
import { Button } from '../shared/ui';
import { FileText, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';

const sections = [
  {
    title: 'User responsibilities',
    body: 'Customers must provide accurate account details, contact numbers, delivery addresses, and order information. Users are responsible for keeping their login credentials private and for reviewing their basket before checkout.',
  },
  {
    title: 'Account usage',
    body: 'Accounts should only be used by the registered user. Annaya may restrict accounts that are used for spam, fake orders, abusive activity, or attempts to bypass security and verification controls.',
  },
  {
    title: 'Food ordering rules',
    body: 'Orders can be placed only for available menu items from active restaurants. Prices, item availability, preparation time, and restaurant open or closed status may change based on restaurant operations.',
  },
  {
    title: 'Payment and refunds',
    body: 'Customers should check all totals, discounts, delivery charges, and order details before confirming an order. Refunds or cancellations may depend on order status, restaurant acceptance, delivery progress, and platform policies.',
  },
  {
    title: 'Delivery policy',
    body: 'Delivery time is an estimate and may be affected by restaurant preparation, rider availability, traffic, weather, or incorrect delivery information. Customers should remain reachable on the registered phone number during delivery.',
  },
  {
    title: 'Restaurant availability',
    body: 'Restaurants may be marked Open, Closed, or Unavailable. Closed or suspended restaurants may not accept new orders until their status changes.',
  },
  {
    title: 'Prohibited misuse',
    body: 'Users must not create fake accounts, place fraudulent orders, abuse coupons, interfere with the platform, access another user’s data, or misuse the ordering, review, delivery, or support features.',
  },
  {
    title: 'Privacy and data usage',
    body: 'The system uses account, phone, order, delivery, and preference information to provide authentication, OTP verification, order processing, customer support, and relevant restaurant recommendations.',
  },
  {
    title: 'Limitation of liability',
    body: 'Annaya aims to provide a reliable food ordering experience, but it is not responsible for delays, item quality concerns, restaurant-side errors, network issues, or events outside reasonable platform control.',
  },
];

export function TermsAndConditions() {
  return (
    <div className="bg-white dark:bg-black dark:text-white">
      <section className="bg-gradient-to-br from-[#22C55E]/10 via-white to-[#F97316]/5 dark:from-black dark:via-black dark:to-black">
        <div className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#16A34A]">Legal information</p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">Terms & Conditions</h1>
            <p className="mt-5 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Please read these terms before creating an account or placing an order through Annaya Food Delivery.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild><Link to="/signup">Create account</Link></Button>
              <Button variant="outline" asChild><Link to="/faqs">Read FAQs</Link></Button>
            </div>
          </div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <FileText className="mb-4 h-10 w-10 text-[#22C55E]" />
            <h2 className="text-2xl font-semibold">Customer agreement</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-300">
              By signing up, you confirm that your phone number is yours, you agree to receive OTP verification messages, and you accept these platform terms.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-14">
        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <ShieldCheck className="mb-4 h-8 w-8 text-[#16A34A]" />
            <h3 className="text-xl font-semibold">Secure accounts</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Phone verification helps protect user accounts and prevents duplicate phone registrations.</p>
          </div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <ShoppingBag className="mb-4 h-8 w-8 text-[#F97316]" />
            <h3 className="text-xl font-semibold">Clear ordering</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Customers are expected to review restaurant, item, quantity, note, and payment details before checkout.</p>
          </div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <Truck className="mb-4 h-8 w-8 text-[#22C55E]" />
            <h3 className="text-xl font-semibold">Delivery cooperation</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Accurate addresses and reachable phone numbers help riders complete deliveries smoothly.</p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-4">
          {sections.map((item, index) => (
            <article key={item.title} className="rounded-3xl border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#22C55E]/10 text-sm font-bold text-[#16A34A]">{index + 1}</span>
                <div>
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <p className="mt-2 leading-7 text-gray-600 dark:text-gray-300">{item.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
