import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Activity
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const formatCurrency = (v) => {
  if (v >= 10000000) return `${(v / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (v >= 100000) return `${(v / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return String(v);
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {value === undefined ? "0" : `₹${Math.abs(value).toLocaleString("en-IN")}`}
      </p>
    </div>
    <div className="p-3 rounded-xl bg-gray-800">
      <Icon size={20} className={color} />
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm">
        <p className="text-gray-300 font-semibold mb-1">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: ₹{Number(entry.value).toLocaleString("en-IN")}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { token, user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    const headers = { 
      Authorization: `Bearer ${token}`, 
      "X-Workspace-Id": String(user?.workspaceId || token) 
    };
    Promise.all([
      fetch(`${API}/api/dashboard/summary`, { headers }).then((r) => r.json()),
      fetch(`${API}/api/dashboard/cashflow-chart`, { headers }).then((r) => r.json()),
    ])
      .then(([summaryData, chartData]) => {
        setSummary(summaryData);
        setChart(chartData);

        if (chartData && chartData.length > 0) {
          // Count months per year, default to the year with the MOST data points
          const yearCounts = {};
          chartData.forEach((d) => {
            const year = d.month.split(" ")[1];
            yearCounts[year] = (yearCounts[year] || 0) + 1;
          });
          const dominantYear = Object.entries(yearCounts).sort((a, b) => b[1] - a[1])[0][0];
          setSelectedYear(dominantYear);
        }

        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load dashboard data");
        setLoading(false);
      });
  }, [token]);

  const filteredChart = useMemo(() => {
    if (!selectedYear || chart.length === 0) return chart;
    return chart.filter((d) => d.month.endsWith(selectedYear));
  }, [chart, selectedYear]);

  // Sort available years: most data first, then alphabetically
  const availableYears = useMemo(() => {
    if (!chart || chart.length === 0) return [];
    const yearCounts = {};
    chart.forEach((d) => {
      const year = d.month.split(" ")[1];
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    return Object.entries(yearCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([year]) => year);
  }, [chart]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your business cash flow at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Income"
          value={summary.totalIncome}
          icon={TrendingUp}
          color="text-emerald-400"
        />
        <StatCard
          label="Total Expense"
          value={summary.totalExpense}
          icon={TrendingDown}
          color="text-red-400"
        />
        <StatCard
          label="Net Cash Flow"
          value={summary.netCashFlow}
          icon={DollarSign}
          color={summary.netCashFlow >= 0 ? "text-blue-400" : "text-red-400"}
        />
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Transactions</p>
            <p className="text-2xl font-bold text-white">{summary.transactionCount ?? 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-800">
            <Activity size={20} className="text-yellow-400" />
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest">
            Monthly Cash Flow
          </h2>
          {availableYears.length > 1 && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
        </div>

        {filteredChart.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-600 text-sm">
            No chart data for {selectedYear}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredChart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#9ca3af", paddingTop: "12px" }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
              <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
