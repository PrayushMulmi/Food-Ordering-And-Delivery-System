// v2 update
import { useState } from "react";
import { Badge } from "../../shared/ui";
import { Button } from "../../shared/ui";
import { Input } from "../../shared/ui";
import { Search, Eye } from "lucide-react";
import { Link } from 'react-router-dom';

const mockOrders = [
  {
    id: "ORD-001",
    customerName: "John Doe",
    items: "2x Margherita Pizza, 1x Caesar Salad",
    total: "$45.50",
    status: "delivered",
    date: "Mar 24, 2026 - 2:30 PM",
    address: "123 Main St, Downtown",
  },
  {
    id: "ORD-002",
    customerName: "Sarah Smith",
    items: "1x Chicken Burger, 1x Fries",
    total: "$28.00",
    status: "preparing",
    date: "Mar 24, 2026 - 3:15 PM",
    address: "456 Oak Ave, Westside",
  },
  {
    id: "ORD-003",
    customerName: "Mike Johnson",
    items: "3x Pasta Carbonara, 2x Garlic Bread",
    total: "$67.80",
    status: "on-the-way",
    date: "Mar 24, 2026 - 3:45 PM",
    address: "789 Pine Rd, Eastside",
  },
  {
    id: "ORD-004",
    customerName: "Emily Brown",
    items: "1x Sushi Platter, 1x Miso Soup",
    total: "$52.00",
    status: "pending",
    date: "Mar 24, 2026 - 4:00 PM",
    address: "321 Elm St, Northside",
  },
  {
    id: "ORD-005",
    customerName: "David Wilson",
    items: "2x Chicken Tikka, 1x Naan Bread",
    total: "$38.50",
    status: "cancelled",
    date: "Mar 24, 2026 - 1:20 PM",
    address: "654 Maple Dr, Southside",
  },
];

const statusConfig = {
  delivered: { bg: "bg-[#22C55E]", text: "Delivered" },
  preparing: { bg: "bg-[#F97316]", text: "Preparing" },
  "on-the-way": { bg: "bg-[#FACC15] text-black", text: "On the Way" },
  pending: { bg: "bg-gray-400", text: "Pending" },
  cancelled: { bg: "bg-red-500", text: "Cancelled" },
};

export function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Orders Management</h1>

      {/* Search and Filter */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Input
              placeholder="Search by order ID or customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#22C55E] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="on-the-way">On the Way</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#22C55E] text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Order ID</th>
                <th className="px-6 py-4 text-left font-semibold">Customer</th>
                <th className="px-6 py-4 text-left font-semibold">Items</th>
                <th className="px-6 py-4 text-left font-semibold">Total</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Date</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold">{order.id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-gray-600">{order.address}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{order.items}</td>
                  <td className="px-6 py-4 font-semibold text-[#22C55E]">{order.total}</td>
                  <td className="px-6 py-4">
                    <Badge
                      className={`${
                        statusConfig[order.status].bg
                      } text-white`}
                    >
                      {statusConfig[order.status].text}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                  <td className="px-6 py-4">
                    <Link to={`/order/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No orders found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
