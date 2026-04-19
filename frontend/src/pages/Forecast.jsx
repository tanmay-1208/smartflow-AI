import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ComposedChart, Bar, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Brain, ShieldCheck } from "lucide-react";

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
    upperBound: f.upperBoundNet,
    lowerBound: f.lowerBoundNet,
    confidenceRange: [f.lowerBoundNet, f.upperBoundNet],
  })) || [];

  const trendColor =
    data?.trend === "IMPROVING" ? "text-emerald-400" :
    data?.trend === "DECLINING" ? "text-red-400" : "text-amber-400";

  const trendBg =
    data?.trend === "IMPROVING" ? "bg-emerald-500/10 border-emerald-500/20" :
    data?.trend === "DECLINING" ? "bg-red-500/10 border-red-500/20" : "bg-amber-500/10 border-amber-500/20";

  const TrendIcon =
    data?.trend === "IMPROVING" ? TrendingUp :
    data?.trend === "DECLINING" ? TrendingDown : Minus;

  const confidenceColor = (score) => {
    if (score >= 70) return "text-emerald-400";
    if (score >= 40) return "text-amber-400";
    return "text-red-400";
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0]?.payload;
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm shadow-xl">
          <p className="text-gray-200 font-semibold mb-2">{label}</p>
          {payload.filter(p => p.dataKey !== "confidenceRange").map((entry) => (
            <p key={entry.name} style={{ color: entry.color }} className="flex justify-between gap-4">
              <span>{entry.name}:</span>
              <span className="font-medium">₹{Number(entry.value).toLocaleString("en-IN")}</span>
            </p>
          ))}
          {d?.upperBound != null && (
            <div className="mt-2 pt-2 border-t border-gray-700 text-gray-400 text-xs">
              <p>Optimistic: ₹{d.upperBound?.toLocaleString("en-IN")}</p>
              <p>Pessimistic: ₹{d.lowerBound?.toLocaleString("en-IN")}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Brain size={28} className="text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Cash Flow Forecast</h1>
          </div>
          <p className="text-gray-400 mt-1">
            AI-powered predictions using {data?.modelType || "advanced smoothing algorithms"}
          </p>
        </div>

        {/* Month selector */}
        <div className="flex gap-3 mb-8">
          {[3, 6, 9].map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
                months === m
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
              }`}
            >
              {m} Months
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center text-gray-400 py-20">
            <Brain size={32} className="mx-auto mb-3 animate-pulse text-blue-400" />
            Running forecast model...
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 py-20">{error}</div>
        )}

        {data && !loading && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
              <div className={`bg-gray-900 rounded-xl p-4 border ${trendBg}`}>
                <p className="text-gray-400 text-sm">Trend</p>
                <div className={`flex items-center gap-1.5 mt-1 ${trendColor}`}>
                  <TrendIcon size={20} />
                  <span className="text-xl font-bold">{data.trend}</span>
                </div>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <ShieldCheck size={14} />
                  <span>Confidence</span>
                </div>
                <p className={`text-xl font-bold mt-1 ${confidenceColor(data.confidenceScore || 0)}`}>
                  {data.confidenceScore?.toFixed(0) || 0}%
                </p>
              </div>
            </div>

            {/* Chart with confidence bands */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-200">
                  Projected Cash Flow — Next {months} Months
                </h2>
                <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                  {data.modelType || "Exponential Smoothing"}
                </span>
              </div>
              <ResponsiveContainer width="100%" height={360}>
                <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: "#9ca3af" }} />

                  {/* Confidence band as area */}
                  <Area
                    dataKey="confidenceRange"
                    fill="#3b82f6"
                    fillOpacity={0.08}
                    stroke="none"
                    name="Confidence Range"
                    legendType="none"
                  />

                  <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="Net Cash Flow" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly breakdown table */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-200">Monthly Breakdown</h2>
                <span className="text-xs text-gray-500">Amounts in ₹</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Month</th>
                      <th className="text-right p-4 text-gray-400 text-sm font-medium">Income</th>
                      <th className="text-right p-4 text-gray-400 text-sm font-medium">Expense</th>
                      <th className="text-right p-4 text-gray-400 text-sm font-medium">Net Cash Flow</th>
                      <th className="text-right p-4 text-gray-400 text-sm font-medium">Optimistic</th>
                      <th className="text-right p-4 text-gray-400 text-sm font-medium">Pessimistic</th>
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
                        <td className="p-4 text-right text-emerald-400/60 text-sm">
                          ₹{f.upperBoundNet?.toLocaleString("en-IN") || "—"}
                        </td>
                        <td className="p-4 text-right text-red-400/60 text-sm">
                          ₹{f.lowerBoundNet?.toLocaleString("en-IN") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
