import { Link } from 'react-router-dom';
import { Button } from '../shared/ui';

const faqs = [
  { question: 'How do I place an order?', answer: 'Open the Restaurants page, select a restaurant, add available food items to your basket, review the basket, choose your delivery address, and confirm checkout.' },
  { question: 'Can I order from a closed restaurant?', answer: 'No. Closed restaurants are clearly marked, and the system prevents adding items or placing orders until the restaurant is open again.' },
  { question: 'How do I track my order?', answer: 'After checkout, open Order History and select your order. You can view the latest status, delivery address, restaurant details, and bill.' },
  { question: 'Can I add allergy or special preparation notes?', answer: 'Yes. Add your note during checkout. Restaurant admins can view it in the order details before preparing the food.' },
  { question: 'How does password reset work?', answer: 'Use Forgot Password on the customer login page. Enter your username or email, enter your registered 10-digit phone number, verify the WhatsApp OTP, then set a new password.' },
  { question: 'What price levels are used?', answer: 'Restaurants are grouped by Low, Medium, and High price levels so customers can filter choices without symbol-based pricing.' },
  { question: 'How do I print my bill?', answer: 'Open your delivered or active order and select Print in the bill section. Only the invoice content is sent to the printer.' },
];

export function FAQs() {
  return (
    <div className="container mx-auto px-4 py-14">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#16A34A]">Help center</p>
        <h1 className="text-4xl font-bold md:text-5xl">Frequently Asked Questions</h1>
        <p className="mt-4 text-gray-600">Answers for ordering, delivery, payment, accounts, password reset, restaurant availability, and billing.</p>
      </div>

      <div className="mx-auto max-w-4xl space-y-4">
        {faqs.map((item) => (
          <details key={item.question} className="group rounded-3xl border bg-white p-6 shadow-sm open:border-[#22C55E]">
            <summary className="cursor-pointer list-none text-lg font-semibold text-gray-900">{item.question}</summary>
            <p className="mt-3 text-sm leading-6 text-gray-600">{item.answer}</p>
          </details>
        ))}
      </div>

      <div className="mt-10 rounded-3xl bg-[#f0fdf4] p-6 text-center">
        <h2 className="text-2xl font-semibold">Still need help?</h2>
        <p className="mt-2 text-gray-600">Contact Annaya support or browse restaurants to continue your order.</p>
        <div className="mt-5 flex justify-center gap-3">
          <Button asChild><Link to="/restaurants">Browse restaurants</Link></Button>
          <Button variant="outline" asChild><Link to="/about">About us</Link></Button>
        </div>
      </div>
    </div>
  );
}
