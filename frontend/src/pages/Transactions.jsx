import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Transactions() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [isLive, setIsLive] = useState(false);

  const fetchTransactions = async () => {
    try {
      const BASE = import.meta.env.VITE_API_URL || "";
      const token = localStorage.getItem("sf_token") || localStorage.getItem("token");
      
      const res = await fetch(`${BASE}/api/transactions`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      
      // Deduplicate by ID
      const uniqueMap = new Map();
      json.forEach(t => uniqueMap.set(t.id, t));
      const uniqueData = Array.from(uniqueMap.values());
      
      // Sort by date DESC
      uniqueData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setData(uniqueData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
    
    setIsLive(true);
    const channel = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => fetchTransactions()
      )
      .subscribe();

    return () => {
      setIsLive(false);
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredData = data.filter((t) => {
    const matchesFilter = filter === "ALL" || t.type === filter;
    const matchesSearch = 
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 text-white min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header & Live Indicator */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Transactions
            {isLive && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                LIVE
              </span>
            )}
          </h1>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 bg-gray-900 border border-gray-800 p-4 rounded-xl shadow-sm">
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter("ALL")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "ALL" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter("INCOME")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "INCOME" ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}
            >
              Income
            </button>
            <button 
              onClick={() => setFilter("EXPENSE")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "EXPENSE" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"}`}
            >
              Expense
            </button>
          </div>
          <input 
            type="text"
            placeholder="Search by description or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-sm rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 w-full sm:w-64 transition-colors"
          />
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-950 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500 text-sm">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-800/60 transition-colors">
                      <td className="p-4 text-sm text-gray-300">{t.date}</td>
                      <td className="p-4 text-sm font-medium text-gray-100">{t.description}</td>
                      <td className="p-4 text-sm text-gray-400">
                        <span className="px-2.5 py-1 bg-gray-800 rounded-lg text-xs font-medium border border-gray-700">
                          {t.category}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        <span className={`text-xs font-bold tracking-wide px-2 py-1 rounded-md bg-opacity-10 
                          ${t.type === 'INCOME' ? 'text-green-400 bg-green-900/40' : 'text-red-400 bg-red-900/40'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className={`p-4 text-sm font-bold text-right tracking-wide
                        ${t.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type === 'INCOME' ? '+ ' : '- '}₹{Number(Math.abs(t.amount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
