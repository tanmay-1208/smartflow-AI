import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

const API = import.meta.env.VITE_API_URL;

export default function Forecast() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [months, setMonths] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API}/api/forecast?months=${months}`, {
      headers: { Authorization: `Bearer ${token}`, "X-User-Id": token },
    })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError("Failed to load forecast"); setLoading(false); });
  }, [months, token]);

  const chartData = data?.forecasts?.map((f) => ({
    month: f.month,
    Income: f.predictedIncome,
    Expense: Math.abs(f.predictedExpense),
    "Net Cash Flow": f.predictedNetCashFlow,
  })) || [];

  const trendColor =
    data?.trend === "IMPROVING" ? "text-green-400" :
    data?.trend === "DECLINING" ? "text-red-400" : "text-yellow-400";

  const trendIcon =
    data?.trend === "IMPROVING" ? "↑" :
    data?.trend === "DECLINING" ? "↓" : "→";

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Cash Flow Forecast</h1>
          <p className="text-gray-400 mt-1">AI-powered predictions based on your transaction history</p>
        </div>

        {/* Month selector */}
        <div className="flex gap-3 mb-8">
          {[3, 6, 9].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-5 py-2 rounded-lg font-medium transition-colors ${
                months === m
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {m} Months
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center text-gray-400 py-20">Loading forecast...</div>
        )}

        {error && (
          <div className="text-center text-red-400 py-20">{error}</div>
        )}

        {data && !loading && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Avg Monthly Income</p>
                <p className="text-green-400 text-xl font-bold mt-1">
                  ₹{data.averageMonthlyIncome?.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Avg Monthly Expense</p>
                <p className="text-red-400 text-xl font-bold mt-1">
                  ₹{Math.abs(data.averageMonthlyExpense)?.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Avg Net Cash Flow</p>
                <p className="text-blue-400 text-xl font-bold mt-1">
                  ₹{data.averageNetCashFlow?.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Trend</p>
                <p className={`text-xl font-bold mt-1 ${trendColor}`}>
                  {trendIcon} {data.trend}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-200">
                Projected Cash Flow — Next {months} Months
              </h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: "8px" }}
                    labelStyle={{ color: "#f9fafb" }}
                    formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, ""]}
                  />
                  <Legend wrapperStyle={{ color: "#9ca3af" }} />
                  <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Net Cash Flow" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly breakdown table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-gray-200">Monthly Breakdown</h2>
              </div>
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left p-4 text-gray-400 text-sm font-medium">Month</th>
                    <th className="text-right p-4 text-gray-400 text-sm font-medium">Income</th>
                    <th className="text-right p-4 text-gray-400 text-sm font-medium">Expense</th>
                    <th className="text-right p-4 text-gray-400 text-sm font-medium">Net Cash Flow</th>
                  </tr>
                </thead>
                <tbody>
                  {data.forecasts.map((f, i) => (
                    <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="p-4 text-gray-200 font-medium">{f.month}</td>
                      <td className="p-4 text-right text-green-400">
                        ₹{f.predictedIncome.toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 text-right text-red-400">
                        ₹{Math.abs(f.predictedExpense).toLocaleString("en-IN")}
                      </td>
                      <td className={`p-4 text-right font-semibold ${
                        f.predictedNetCashFlow >= 0 ? "text-blue-400" : "text-red-400"
                      }`}>
                        ₹{f.predictedNetCashFlow.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
