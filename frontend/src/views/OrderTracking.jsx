import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge, Button, ConfirmDialog } from "../shared/ui";
import { BackButton } from "../shared/navigation";
import {
  Check,
  Clock,
  MapPin,
  Package,
  Printer,
  ReceiptText,
  Truck,
} from "lucide-react";
import { api, fileUrl } from "../lib/api";
import { toast } from "sonner";
import { LiveOrderMap } from "../components/LiveOrderMap";

const steps = [
  { key: "Pending", label: "Order Confirmed", icon: Check },
  { key: "Preparing", label: "Preparing", icon: Package },
  { key: "Out for Delivery", label: "Out for Delivery", icon: Truck },
  { key: "Delivered", label: "Delivered", icon: MapPin },
];

const VAT_RATE = 0.13;
const money = (value) => Number(value || 0).toFixed(2);

function StatusTimeline({ activeIndex, order }) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Delivery status</h2>
          <p className="text-sm text-gray-500">Live progress</p>
        </div>
        <Badge>{order.status}</Badge>
      </div>
      <div className="relative">
        {steps.map((step, index) => {
          const completed = index <= activeIndex;
          const Icon = step.icon;
          return (
            <div
              key={step.key}
              className="relative mb-7 flex items-start gap-4 last:mb-0"
            >
              {index !== steps.length - 1 && (
                <div
                  className={`absolute left-6 top-12 h-14 w-1 rounded-full ${completed ? "bg-[#22C55E]" : "bg-gray-300"}`}
                />
              )}
              <div
                className={`z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${completed ? "bg-[#22C55E] text-white" : "bg-gray-200 text-gray-400"}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-base font-semibold">{step.label}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {completed
                    ? "Updated in your live order history"
                    : "Pending update"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 rounded-2xl bg-[#22C55E]/10 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F97316]/20">
            <Clock className="h-5 w-5 text-[#F97316]" />
          </div>
          <div>
            <h3 className="font-semibold">
              {order.status === "Delivered"
                ? "Delivered Successfully"
                : "Arriving Soon!"}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {order.status === "Delivered"
                ? "Your order has arrived."
                : "Track live progress from the restaurant."}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 text-sm">
        <div className="rounded-2xl border p-3">
          <p className="text-gray-500">Delivery Address</p>
          <p className="font-semibold text-gray-900">
            {order.delivery_address}
          </p>
        </div>
        <div className="rounded-2xl border p-3">
          <p className="text-gray-500">Restaurant</p>
          <p className="font-semibold text-gray-900">{order.restaurant_name}</p>
        </div>
      </div>
    </div>
  );
}

function getUnitRateBeforeTax(item) {
  return Number(item.unit_price || 0) / (1 + VAT_RATE);
}

function getItemPriceBeforeTax(item) {
  return getUnitRateBeforeTax(item) * Number(item.quantity || 0);
}

function getItemTax(item) {
  return Number(item.total_price || 0) - getItemPriceBeforeTax(item);
}

function printBill() {
  if (typeof document === "undefined") return;
  const printable = document.querySelector(".print-only-bill-content");
  if (!printable) {
    window.print();
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const printDocument = iframe.contentWindow?.document;
  if (!printDocument) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  printDocument.open();
  printDocument.write(`<!doctype html>
    <html>
      <head>
        <title>Bill</title>
        <style>
          @page { margin: 10mm; size: auto; }
          * { box-sizing: border-box; }
          body { margin: 0; background: #fff; color: #111827; font-family: Arial, Helvetica, sans-serif; }
          .print-only-bill-content { display: block; max-width: 190mm; margin: 0 auto; font-size: 12px; line-height: 1.45; }
          .flex { display: flex; } .grid { display: grid; } .items-start { align-items: flex-start; } .justify-between { justify-content: space-between; }
          .gap-3 { gap: 0.75rem; } .gap-4 { gap: 1rem; } .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .col-span-2 { grid-column: span 2 / span 2; } .text-right { text-align: right; } .text-center { text-align: center; }
          .font-bold { font-weight: 700; } .font-semibold { font-weight: 600; } .uppercase { text-transform: uppercase; }
          .text-xl { font-size: 20px; } .text-lg { font-size: 18px; } .text-base { font-size: 16px; } .text-sm { font-size: 12px; } .text-xs { font-size: 11px; }
          .mb-5 { margin-bottom: 1.25rem; } .mt-5 { margin-top: 1.25rem; } .mt-8 { margin-top: 2rem; } .ml-auto { margin-left: auto; }
          .pb-4 { padding-bottom: 1rem; } .pt-3 { padding-top: 0.75rem; } .p-3 { padding: 0.75rem; } .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; } .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          .border, .border-b, .border-t { border-color: #111827; } .border { border: 1px solid #111827; } .border-b { border-bottom: 1px solid #111827; } .border-t { border-top: 1px solid #111827; }
          .rounded { border-radius: 4px; } .rounded object-contain, img { max-width: 100%; } .h-16 { height: 64px; } .w-16 { width: 64px; } .object-contain { object-fit: contain; }
          table { width: 100%; border-collapse: collapse; page-break-inside: auto; } tr { page-break-inside: avoid; page-break-after: auto; } th, td { border: 1px solid #111827; padding: 6px 8px; }
          .max-w-sm { max-width: 360px; } .space-y-2 > * + * { margin-top: 0.5rem; }
        </style>
      </head>
      <body>${printable.outerHTML}</body>
    </html>`);
  printDocument.close();

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 250);
  };

  const runPrint = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      cleanup();
    }, 250);
  };

  iframe.onload = runPrint;
  setTimeout(() => {
    if (iframe.parentNode) runPrint();
  }, 500);
}

function KotInvoice({ order }) {
  const subtotal = Number(order.subtotal || 0);
  const vatPortion = subtotal > 0 ? subtotal - subtotal / (1 + VAT_RATE) : 0;
  const discount = Number(order.discount_amount || 0);
  const deliveryFee = Number(order.delivery_fee || 0);
  const finalTotal = Number(order.final_total || 0);

  return (
    <section className="print-bill-section rounded-3xl border bg-white p-6 shadow-sm print:border-none print:shadow-none">
      <div className="screen-bill-content">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b pb-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#166534]">
              <ReceiptText className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                VAT Bill / KOT
              </span>
            </div>
            <h2 className="text-2xl font-semibold">{order.restaurant_name}</h2>
            <p className="text-sm text-gray-500">Order #{order.order_code}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={printBill}
            className="print:hidden"
          >
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>

        <div className="mb-5 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <p className="text-gray-500">Customer</p>
            <p className="font-semibold">{order.customer_name || "Customer"}</p>
          </div>
          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-semibold">
              {order.created_at
                ? new Date(order.created_at).toLocaleString()
                : "N/A"}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-500">Delivery Address</p>
            <p className="font-semibold">{order.delivery_address}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{item.item_name}</td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">
                    Rs. {money(item.unit_price)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    Rs. {money(item.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto mt-5 max-w-sm space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rs. {money(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT 13% included</span>
            <span>Rs. {money(vatPortion)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-[#166534]">
              <span>Discount</span>
              <span>- Rs. {money(discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery fee</span>
            <span>Rs. {money(deliveryFee)}</span>
          </div>
          <div className="border-t pt-3 text-base font-semibold">
            <div className="flex justify-between">
              <span>Final total</span>
              <span>Rs. {money(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="print-only-bill-content text-sm leading-relaxed">
        <div className="mb-5 flex items-start justify-between gap-4 border-b pb-4">
          <div className="flex items-start gap-3">
            {order.restaurant_logo_url && (
              <img src={fileUrl(order.restaurant_logo_url)} alt={order.restaurant_name} className="h-16 w-16 rounded object-contain" />
            )}
            <div>
              <h2 className="text-xl font-bold">{order.restaurant_name}</h2>
              <p>{order.restaurant_address || 'Restaurant address not available'}</p>
              <p>Contact: {order.restaurant_contact_phone || 'Not available'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold uppercase">Tax Invoice</p>
            <p>Invoice No: {order.order_code}</p>
            <p>Date: {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-4 rounded border p-3">
          <div>
            <p className="font-semibold">Bill To</p>
            <p>{order.customer_name || 'Customer'}</p>
            <p>{order.customer_phone || ''}</p>
          </div>
          <div>
            <p className="font-semibold">Delivery Details</p>
            <p>{order.delivery_address}</p>
            <p>Status: {order.status}</p>
          </div>
          <div className="col-span-2">
            <p className="font-semibold">Customer Note</p>
            <p>{order.notes?.trim() || 'No note added.'}</p>
          </div>
        </div>

        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="border px-3 py-2">SN</th>
              <th className="border px-3 py-2">Item name</th>
              <th className="border px-3 py-2 text-center">Qty</th>
              <th className="border px-3 py-2 text-right">Rate before tax</th>
              <th className="border px-3 py-2 text-right">Tax</th>
              <th className="border px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item, index) => (
              <tr key={item.id}>
                <td className="border px-3 py-2">{index + 1}</td>
                <td className="border px-3 py-2">{item.item_name}</td>
                <td className="border px-3 py-2 text-center">{item.quantity}</td>
                <td className="border px-3 py-2 text-right">Rs. {money(getUnitRateBeforeTax(item))}</td>
                <td className="border px-3 py-2 text-right">Rs. {money(getItemTax(item))}</td>
                <td className="border px-3 py-2 text-right">Rs. {money(item.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ml-auto mt-5 max-w-sm space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>Rs. {money(subtotal)}</span></div>
          <div className="flex justify-between"><span>VAT 13% included</span><span>Rs. {money(vatPortion)}</span></div>
          {discount > 0 && <div className="flex justify-between"><span>Discount</span><span>- Rs. {money(discount)}</span></div>}
          <div className="flex justify-between"><span>Delivery fee</span><span>Rs. {money(deliveryFee)}</span></div>
          <div className="border-t pt-3 text-base font-semibold"><div className="flex justify-between"><span>Grand total</span><span>Rs. {money(finalTotal)}</span></div></div>
        </div>
        <div className="mt-8 border-t pt-3 text-center text-xs">
          <p>Thank you for ordering with {order.restaurant_name} through Annaya.</p>
          <p>This is a computer generated bill.</p>
        </div>
      </div>
    </section>
  );
}

export function OrderTracking() {
  const { code } = useParams();
  const [order, setOrder] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const loadOrder = useCallback(
    () =>
      api
        .get(`/api/orders/my/${code}`)
        .then((res) => setOrder(res.data || null)),
    [code],
  );

  useEffect(() => {
    loadOrder().catch(() => {});
  }, [loadOrder]);

  useEffect(() => {
    if (
      !order ||
      !["Preparing", "Ready for Dispatch", "Out for Delivery"].includes(
        order.status,
      )
    )
      return undefined;
    const timer = window.setInterval(
      () => {
        loadOrder().catch(() => {});
      },
      order.status === "Out for Delivery" ? 10000 : 15000,
    );

    return () => window.clearInterval(timer);
  }, [loadOrder, order]);

  const cancelOrder = async () => {
    try {
      await api.put(`/api/orders/my/${code}/cancel`, {});
      toast.success("Order cancelled");
      setCancelDialogOpen(false);
      loadOrder();
    } catch (error) {
      toast.error(error.message || "Could not cancel order");
    }
  };

  const activeIndex = useMemo(() => {
    if (!order) return 0;
    if (order.status === "Delivered") return 3;
    if (order.status === "Out for Delivery") return 2;
    if (["Preparing", "Ready for Dispatch"].includes(order.status)) return 1;
    return 0;
  }, [order]);

  if (!order)
    return <div className="container mx-auto px-4 py-10">Loading order...</div>;

  return (
    <div className="order-tracking-page min-h-screen bg-white">
      <div className="container mx-auto max-w-7xl px-4 pt-6">
        <BackButton
          fallbackPath="/orders"
          variant="outline"
          label="Back to orders"
        />
      </div>
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 text-center lg:text-left">
          <h1 className="mb-3 text-4xl font-bold md:text-5xl">
            Track Your Order
          </h1>
          <p className="text-lg text-gray-600">Order ID: #{order.order_code}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.75fr)]">
          <div className="space-y-6">
            <LiveOrderMap order={order} />
            <KotInvoice order={order} />
            {["Pending", "Confirmed", "Preparing"].includes(order.status) && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setCancelDialogOpen(true)}
              >
                Cancel order
              </Button>
            )}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
            <StatusTimeline activeIndex={activeIndex} order={order} />
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Order details</h2>
                  <p className="text-sm text-gray-500">
                    {order.restaurant_name}
                  </p>
                </div>
                <Badge>{order.status}</Badge>
              </div>
              <div className="space-y-3 text-sm">
                {(order.items || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <span>
                      {item.item_name} × {item.quantity}
                    </span>
                    <span>Rs. {money(item.total_price)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {money(order.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <span>- Rs. {money(order.discount_amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery Fee</span>
                  <span>Rs. {money(order.delivery_fee)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>Rs. {money(order.final_total)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={cancelDialogOpen}
        title="Cancel this order?"
        description="This action will cancel the current order and stop further preparation."
        confirmText="Cancel order"
        confirmVariant="destructive"
        onCancel={() => setCancelDialogOpen(false)}
        onConfirm={cancelOrder}
      />
    </div>
  );
}
