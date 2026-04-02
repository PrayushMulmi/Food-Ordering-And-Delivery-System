// VERSION 2
import { TrendingUp, Store, Users, DollarSign, ShoppingBag } from "lucide-react";

const statsData = [
  {
    label: "Total Restaurants",
    value: "248",
    change: "+12",
    trend: "up",
    icon: Store,
    color: "from-[#22C55E] to-[#16A34A]",
  },
  {
    label: "Total Users",
    value: "15,842",
    change: "+324",
    trend: "up",
    icon: Users,
    color: "from-[#F97316] to-[#EA580C]",
  },
  {
    label: "Platform Revenue",
    value: "$1.2M",
    change: "+18%",
    trend: "up",
    icon: DollarSign,
    color: "from-[#FACC15] to-[#EAB308]",
  },
  {
    label: "Total Orders",
    value: "45,678",
    change: "+1,234",
    trend: "up",
    icon: ShoppingBag,
    color: "from-purple-500 to-purple-700",
  },
];

const recentRestaurants = [
  { name: "Serene Cafe", location: "Bouddha, Kathmandu", status: "active", joinedDate: "Mar 20, 2026" },
  { name: "Pizza Palace", location: "Main Street, Block A", status: "active", joinedDate: "Mar 19, 2026" },
  { name: "Sushi Express", location: "City Center", status: "pending", joinedDate: "Mar 18, 2026" },
  { name: "Burger Barn", location: "West End", status: "active", joinedDate: "Mar 17, 2026" },
];

const topPerformers = [
  { restaurant: "Golden Dragon", orders: 2345, revenue: "$45,678", rating: 4.8 },
  { restaurant: "Italian Bistro", orders: 2120, revenue: "$42,340", rating: 4.7 },
  { restaurant: "Sushi Master", orders: 1987, revenue: "$39,740", rating: 4.9 },
  { restaurant: "Burger King", orders: 1876, revenue: "$37,520", rating: 4.6 },
];

export function SuperAdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Platform Overview</h1>
        <p className="text-gray-600 text-lg">Monitor and manage your food delivery platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.color} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="h-10 w-10" />
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-semibold">{stat.change}</span>
                </div>
              </div>
              <p className="text-sm opacity-90 mb-1">{stat.label}</p>
              <p className="text-4xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Restaurants */}
        <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-[#22C55E] px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Recent Restaurants</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentRestaurants.map((restaurant, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">{restaurant.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      restaurant.status === "active"
                        ? "bg-[#22C55E] text-white"
                        : "bg-[#FACC15] text-black"
                    }`}
                  >
                    {restaurant.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{restaurant.location}</p>
                <p className="text-xs text-gray-500 mt-1">Joined: {restaurant.joinedDate}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-[#F97316] px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Top Performing Restaurants</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {topPerformers.map((performer, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold">{performer.restaurant}</h3>
                  <div className="flex items-center gap-1 bg-[#FACC15] px-3 py-1 rounded-full">
                    <span className="text-sm font-bold">{performer.rating}</span>
                    <span className="text-sm">⭐</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Orders</p>
                    <p className="font-semibold">{performer.orders.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Revenue</p>
                    <p className="font-semibold text-[#22C55E]">{performer.revenue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Chart Placeholder */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Platform Activity (Last 7 Days)</h2>
        <div className="flex items-end justify-between gap-4 h-64">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
            const height = Math.random() * 80 + 20;
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-sm font-semibold text-gray-700">
                  {Math.floor(Math.random() * 500 + 500)}
                </div>
                <div
                  className="w-full bg-gradient-to-t from-[#22C55E] to-[#16A34A] rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ height: `${height}%` }}
                />
                <div className="text-sm font-medium text-gray-600">{day}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
