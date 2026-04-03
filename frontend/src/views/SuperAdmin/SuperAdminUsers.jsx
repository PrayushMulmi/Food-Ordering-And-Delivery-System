// v4
import { useState } from "react";
import { Search, Eye, MoreVertical, Mail, Phone } from "lucide-react";
import { Input } from "../../shared/ui";
import { Button } from "../../shared/ui";
import { ImageWithFallback } from "../../shared/ui";

const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+977 98-1234-5678",
    location: "Downtown, Kathmandu",
    totalOrders: 45,
    totalSpent: "$1,234",
    status: "active",
    joinedDate: "Jan 15, 2025",
    lastOrder: "Mar 23, 2026",
    image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    name: "Sarah Smith",
    email: "sarah.smith@email.com",
    phone: "+977 98-2345-6789",
    location: "Westside, Lalitpur",
    totalOrders: 78,
    totalSpent: "$2,345",
    status: "active",
    joinedDate: "Feb 10, 2025",
    lastOrder: "Mar 24, 2026",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.j@email.com",
    phone: "+977 98-3456-7890",
    location: "Eastside, Bhaktapur",
    totalOrders: 23,
    totalSpent: "$678",
    status: "suspended",
    joinedDate: "Mar 5, 2025",
    lastOrder: "Mar 15, 2026",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: 4,
    name: "Emily Brown",
    email: "emily.brown@email.com",
    phone: "+977 98-4567-8901",
    location: "City Center, Kathmandu",
    totalOrders: 12,
    totalSpent: "$345",
    status: "active",
    joinedDate: "Mar 10, 2025",
    lastOrder: "Mar 22, 2026",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david.w@email.com",
    phone: "+977 98-5678-9012",
    location: "Northside, Kathmandu",
    totalOrders: 56,
    totalSpent: "$1,567",
    status: "active",
    joinedDate: "Jan 20, 2025",
    lastOrder: "Mar 24, 2026",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
  {
    id: 6,
    name: "Lisa Anderson",
    email: "lisa.a@email.com",
    phone: "+977 98-6789-0123",
    location: "Southside, Lalitpur",
    totalOrders: 34,
    totalSpent: "$987",
    status: "inactive",
    joinedDate: "Feb 15, 2025",
    lastOrder: "Feb 28, 2026",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
  },
  {
    id: 7,
    name: "Robert Garcia",
    email: "robert.g@email.com",
    phone: "+977 98-7890-1234",
    location: "University Area, Kathmandu",
    totalOrders: 89,
    totalSpent: "$2,890",
    status: "active",
    joinedDate: "Jan 5, 2025",
    lastOrder: "Mar 24, 2026",
    image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
  },
  {
    id: 8,
    name: "Maria Martinez",
    email: "maria.m@email.com",
    phone: "+977 98-8901-2345",
    location: "Business District, Kathmandu",
    totalOrders: 8,
    totalSpent: "$234",
    status: "blocked",
    joinedDate: "Mar 15, 2025",
    lastOrder: "Mar 18, 2026",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
  },
];

const statusConfig = {
  active: { bg: "bg-[#22C55E]", text: "Active" },
  suspended: { bg: "bg-[#FACC15] text-black", text: "Suspended" },
  blocked: { bg: "bg-red-500", text: "Blocked" },
  inactive: { bg: "bg-gray-400", text: "Inactive" },
};

export function SuperAdminUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id, newStatus) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, status: newStatus } : u)));
  };

  const statusCounts = {
    all: users.length,
    active: users.filter((u) => u.status === "active").length,
    suspended: users.filter((u) => u.status === "suspended").length,
    blocked: users.filter((u) => u.status === "blocked").length,
    inactive: users.filter((u) => u.status === "inactive").length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Users Management</h1>
        <p className="text-gray-600 text-lg">Manage all users on the platform</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {["all", "active", "suspended", "blocked", "inactive"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-6 py-3 rounded-lg font-semibold capitalize whitespace-nowrap transition-all ${
              filterStatus === status
                ? "bg-[#22C55E] text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {status} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8">
        <div className="relative">
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#22C55E] text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">User</th>
                <th className="px-6 py-4 text-left font-semibold">Contact</th>
                <th className="px-6 py-4 text-left font-semibold">Location</th>
                <th className="px-6 py-4 text-left font-semibold">Orders</th>
                <th className="px-6 py-4 text-left font-semibold">Total Spent</th>
                <th className="px-6 py-4 text-left font-semibold">Last Order</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ImageWithFallback
                        src={user.image}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold">{user.name}</p>
                        <p className="text-xs text-gray-600">Joined: {user.joinedDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.location}</td>
                  <td className="px-6 py-4 font-semibold">{user.totalOrders}</td>
                  <td className="px-6 py-4 font-semibold text-[#22C55E]">{user.totalSpent}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.lastOrder}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold border-0 ${
                        statusConfig[user.status].bg
                      } text-white cursor-pointer`}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="blocked">Blocked</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="hover:bg-[#22C55E] hover:text-white">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:bg-gray-200">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No users found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
