//V4
import { Star } from "lucide-react";
import { Badge } from "../../shared/ui";

const statsData = [
  { label: "Total Orders", value: "1,234", color: "from-[#22C55E] to-[#16A34A]" },
  { label: "Revenue", value: "$45,678", color: "from-[#F97316] to-[#EA580C]" },
  { label: "Avg Rating", value: "4.5", color: "from-[#FACC15] to-[#EAB308]" },
  { label: "Total Reviews", value: "856", color: "from-[#22C55E] to-[#16A34A]" },
];

const recentReviews = [
  { stars: 5, comment: "Amazing food and quick delivery!", date: "2 hours ago" },
  { stars: 3, comment: "Good but took longer than expected", date: "5 hours ago" },
  { stars: 4, comment: "Delicious! Will order again", date: "1 day ago" },
  { stars: 4, comment: "Great quality and packaging", date: "2 days ago" },
];

const bestsellers = [
  { name: "Margherita Pizza", orders: 234, percentage: 35 },
  { name: "Chicken Burger", orders: 189, percentage: 28 },
  { name: "Caesar Salad", orders: 145, percentage: 22 },
  { name: "Pasta Carbonara", orders: 98, percentage: 15 },
];

export function AdminDashboard() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Restaurant Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Serene Cafe</h1>
        <p className="text-2xl text-gray-600 mb-4">Bouddha, Kathmandu</p>
        <Badge className="bg-[#979494] text-white text-base px-4 py-2">
          {currentDate}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${stat.color} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
          >
            <p className="text-lg font-medium mb-2 opacity-90">{stat.label}</p>
            <p className="text-4xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sales Chart Section */}
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold mb-6">Sales</h2>
          <div className="bg-[#D9D9D9] rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#979494] px-6 py-4">
              <ul className="text-white text-2xl font-semibold list-disc list-inside">
                <li>March</li>
              </ul>
            </div>

            {/* Chart Area */}
            <div className="p-8 flex items-center justify-center gap-8">
              {/* Pie Chart Placeholder */}
              <div className="relative">
                <svg width="250" height="250" viewBox="0 0 250 250">
                  <circle
                    cx="125"
                    cy="125"
                    r="100"
                    fill="#7B7B7B"
                    stroke="black"
                    strokeWidth="2"
                  />
                  <path
                    d="M 125 125 L 125 25 A 100 100 0 0 1 195 185 Z"
                    fill="#D9D9D9"
                  />
                </svg>
              </div>

              {/* Legend */}
              <div className="bg-white border-2 border-black rounded-lg p-6 space-y-4">
                <ul className="text-xl font-semibold list-disc list-inside space-y-2">
                  <li>Sales</li>
                  <li>Profit</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Review Section */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Overall Review</h2>
          <div className="bg-[#D9D9D9] rounded-lg p-6">
            <p className="text-xl font-medium text-center mb-6">Recent Reviews</p>
            
            <div className="space-y-4 mb-8">
              {recentReviews.map((review, index) => (
                <div key={index} className="bg-white border border-black rounded-full px-6 py-3">
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.stars
                            ? "fill-[#FACC15] text-[#FACC15]"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-medium mb-2">Avg Ratings</p>
                <p className="text-3xl font-bold">4.5</p>
              </div>
              <div>
                <p className="text-2xl font-medium mb-2">Total Reviews</p>
                <p className="text-3xl font-bold">60</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bestsellers Section */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Bestsellers</h2>
        <div className="bg-[#D9D9D9] rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#979494] h-12"></div>

          <div className="grid md:grid-cols-2">
            {/* Chart */}
            <div className="p-8 flex items-center justify-center">
              <svg width="250" height="250" viewBox="0 0 250 250">
                <circle
                  cx="125"
                  cy="125"
                  r="100"
                  fill="#7B7B7B"
                  stroke="black"
                  strokeWidth="2"
                />
                <path
                  d="M 125 125 L 125 25 A 100 100 0 0 1 215 145 Z"
                  fill="#D9D9D9"
                />
                <path
                  d="M 125 125 L 215 145 A 100 100 0 0 1 95 215 Z"
                  fill="#FBFBFB"
                />
              </svg>
            </div>

            {/* Legend */}
            <div className="bg-white border-l-2 border-black p-8">
              <ul className="space-y-6 text-xl font-semibold list-disc list-inside">
                {bestsellers.map((item, index) => (
                  <li key={index}>{item.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
