// v4
import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users } from "lucide-react";

const salesData = {
  daily: [
    { date: "Mon", sales: 1200, orders: 45 },
    { date: "Tue", sales: 1500, orders: 52 },
    { date: "Wed", sales: 1800, orders: 61 },
    { date: "Thu", sales: 1400, orders: 48 },
    { date: "Fri", sales: 2100, orders: 72 },
    { date: "Sat", sales: 2400, orders: 85 },
    { date: "Sun", sales: 2200, orders: 78 },
  ],
  weekly: [
    { week: "Week 1", sales: 8500, orders: 312 },
    { week: "Week 2", sales: 9200, orders: 345 },
    { week: "Week 3", sales: 8800, orders: 328 },
    { week: "Week 4", sales: 10100, orders: 389 },
  ],
  monthly: [
    { month: "Jan", sales: 35000, orders: 1250 },
    { month: "Feb", sales: 38000, orders: 1380 },
    { month: "Mar", sales: 42000, orders: 1520 },
  ],
};

export function AdminSalesReport() {
  const [timeRange, setTimeRange] = useState("weekly");

  const data = salesData[timeRange];
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalSales / totalOrders;
  const maxSales = Math.max(...data.map((d) => d.sales));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Sales Report</h1>
        <p className="text-gray-600 text-lg">Track your restaurant's performance and revenue</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-4 mb-8">
        {["daily", "weekly", "monthly"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-6 py-3 rounded-lg font-semibold capitalize transition-all ${
              timeRange === range
                ? "bg-[#22C55E] text-white shadow-lg"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8" />
            <TrendingUp className="h-6 w-6" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Sales</p>
          <p className="text-3xl font-bold">${totalSales.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <ShoppingBag className="h-8 w-8" />
            <TrendingUp className="h-6 w-6" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Orders</p>
          <p className="text-3xl font-bold">{totalOrders}</p>
        </div>

        <div className="bg-gradient-to-br from-[#FACC15] to-[#EAB308] rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8" />
            <TrendingUp className="h-6 w-6" />
          </div>
          <p className="text-sm opacity-90 mb-1">Avg Order Value</p>
          <p className="text-3xl font-bold">${avgOrderValue.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8" />
            <span className="text-sm bg-white/20 px-2 py-1 rounded">+12%</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Growth Rate</p>
          <p className="text-3xl font-bold">+12.5%</p>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-8">Sales Trend</h2>
        
        <div className="flex items-end justify-between gap-4 h-80">
          {data.map((item, index) => {
            const height = (item.sales / maxSales) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-sm font-semibold text-gray-700">
                  ${item.sales.toLocaleString()}
                </div>
                <div
                  className="w-full bg-gradient-to-t from-[#22C55E] to-[#16A34A] rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ height: `${height}%` }}
                />
                <div className="text-sm font-medium text-gray-600">
                  {item.date || item.week || item.month}
                </div>
                <div className="text-xs text-gray-500">{item.orders} orders</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-[#22C55E] px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Detailed Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Period</th>
                <th className="px-6 py-4 text-left font-semibold">Sales</th>
                <th className="px-6 py-4 text-left font-semibold">Orders</th>
                <th className="px-6 py-4 text-left font-semibold">Avg Order Value</th>
                <th className="px-6 py-4 text-left font-semibold">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item, index) => {
                const periodName = item.date || item.week || item.month;
                const avgValue = item.sales / item.orders;
                const prevItem = data[index - 1];
                const trend = prevItem ? ((item.sales - prevItem.sales) / prevItem.sales) * 100 : 0;

                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{periodName}</td>
                    <td className="px-6 py-4 font-semibold text-[#22C55E]">
                      ${item.sales.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">{item.orders}</td>
                    <td className="px-6 py-4">${avgValue.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {index > 0 && (
                        <div className="flex items-center gap-1">
                          {trend > 0 ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-[#22C55E]" />
                              <span className="text-[#22C55E] font-semibold">
                                +{trend.toFixed(1)}%
                              </span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-4 w-4 text-red-500" />
                              <span className="text-red-500 font-semibold">
                                {trend.toFixed(1)}%
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
