import { useState } from "react";
import { Search, Eye, MoreVertical } from "lucide-react";
import { Input } from "../../shared/ui";
import { Button } from "../../shared/ui";
import { ImageWithFallback } from "../../shared/ui";

const mockRestaurants = [
  {
    id: 1,
    name: "Serene Cafe",
    owner: "Ram Sharma",
    location: "Bouddha, Kathmandu",
    cuisine: "Multi-Cuisine",
    rating: 4.5,
    totalOrders: 1234,
    revenue: "$45,678",
    status: "active",
    joinedDate: "Jan 15, 2025",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    name: "Pizza Palace",
    owner: "Sita Thapa",
    location: "Main Street, Block A",
    cuisine: "Italian, Pizza",
    rating: 4.7,
    totalOrders: 2345,
    revenue: "$67,890",
    status: "active",
    joinedDate: "Feb 20, 2025",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&h=100&fit=crop",
  },
  {
    id: 3,
    name: "Sushi Express",
    owner: "Hari Gurung",
    location: "City Center, Level 3",
    cuisine: "Japanese, Sushi",
    rating: 4.8,
    totalOrders: 987,
    revenue: "$32,450",
    status: "suspended",
    joinedDate: "Mar 10, 2025",
    image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=100&h=100&fit=crop",
  },
  {
    id: 4,
    name: "Burger Barn",
    owner: "Krishna Rai",
    location: "West End, Avenue 7",
    cuisine: "American, Burgers",
    rating: 4.4,
    totalOrders: 1567,
    revenue: "$48,920",
    status: "active",
    joinedDate: "Jan 5, 2025",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100&h=100&fit=crop",
  },
  {
    id: 5,
    name: "Noodle House",
    owner: "Maya Lama",
    location: "Chinatown, Plaza 2",
    cuisine: "Asian, Chinese",
    rating: 4.3,
    totalOrders: 876,
    revenue: "$28,340",
    status: "inactive",
    joinedDate: "Dec 12, 2024",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=100&h=100&fit=crop",
  },
  {
    id: 6,
    name: "Curry Kingdom",
    owner: "Bijay Pradhan",
    location: "Spice District, Lane 4",
    cuisine: "Indian, Curry",
    rating: 4.7,
    totalOrders: 1987,
    revenue: "$58,760",
    status: "active",
    joinedDate: "Feb 1, 2025",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop",
  },
  {
    id: 7,
    name: "Taco Fiesta",
    owner: "Santosh Tamang",
    location: "Market Square, Row 5",
    cuisine: "Mexican, Tacos",
    rating: 4.6,
    totalOrders: 1432,
    revenue: "$42,180",
    status: "blocked",
    joinedDate: "Mar 5, 2025",
    image: "https://images.unsplash.com/photo-1613514785940-daed07799d7b?w=100&h=100&fit=crop",
  },
];

const statusConfig = {
  active: { bg: "bg-[#22C55E]", text: "Active" },
  suspended: { bg: "bg-[#FACC15] text-black", text: "Suspended" },
  blocked: { bg: "bg-red-500", text: "Blocked" },
  inactive: { bg: "bg-gray-400", text: "Inactive" },
};

export function SuperAdminRestaurants() {
  const [restaurants, setRestaurants] = useState(mockRestaurants);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || restaurant.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id, newStatus) => {
    setRestaurants(
      restaurants.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const statusCounts = {
    all: restaurants.length,
    active: restaurants.filter((r) => r.status === "active").length,
    suspended: restaurants.filter((r) => r.status === "suspended").length,
    blocked: restaurants.filter((r) => r.status === "blocked").length,
    inactive: restaurants.filter((r) => r.status === "inactive").length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Restaurants Management</h1>
        <p className="text-gray-600 text-lg">Manage all restaurants on the platform</p>
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
            placeholder="Search by restaurant name, owner, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Restaurants Table */}
      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#22C55E] text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Restaurant</th>
                <th className="px-6 py-4 text-left font-semibold">Owner</th>
                <th className="px-6 py-4 text-left font-semibold">Location</th>
                <th className="px-6 py-4 text-left font-semibold">Rating</th>
                <th className="px-6 py-4 text-left font-semibold">Orders</th>
                <th className="px-6 py-4 text-left font-semibold">Revenue</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ImageWithFallback
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold">{restaurant.name}</p>
                        <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{restaurant.owner}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{restaurant.location}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{restaurant.rating}</span>
                      <span className="text-[#FACC15]">⭐</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">{restaurant.totalOrders.toLocaleString()}</td>
                  <td className="px-6 py-4 font-semibold text-[#22C55E]">{restaurant.revenue}</td>
                  <td className="px-6 py-4">
                    <select
                      value={restaurant.status}
                      onChange={(e) =>
                        handleStatusChange(restaurant.id, e.target.value)
                      }
                      className={`px-3 py-1 rounded-full text-sm font-semibold border-0 ${
                        statusConfig[restaurant.status].bg
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

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No restaurants found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
