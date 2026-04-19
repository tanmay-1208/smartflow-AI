import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { getTransactions, addTransaction } from "../api/transactions";
import { useAuth } from "../context/AuthContext";
import { useCollab } from "../context/CollabContext";
import { Plus, X, TrendingUp, TrendingDown, IndianRupee, CalendarDays, Tag, FileText, Loader2 } from "lucide-react";

const CATEGORIES = {
  INCOME: ["Salary", "Sales", "Freelance", "Investment", "Refund", "Other"],
  EXPENSE: ["Food", "Transport", "Rent", "Utilities", "Entertainment", "Shopping", "Health", "Education", "Other"],
};

export default function Transactions() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [isLive, setIsLive] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState("Connecting to Realtime...");
  const collab = useCollab();
  const { token, user } = useAuth();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: "EXPENSE",
    category: "Food",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchTransactions = async () => {
    try {
      const BASE = import.meta.env.VITE_API_URL || "";
      const currentToken = token || localStorage.getItem("sf_token") || localStorage.getItem("token");
      
      const res = await fetch(`${BASE}/api/transactions`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
          "X-Workspace-Id": String(user?.workspaceId || currentToken)
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

    // Note: In Supabase dashboard -> Database -> Replication -> supabase_realtime publication 
    // -> transactions table must be toggled ON for realtime changes to flow through.

    const channel = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          console.log('Realtime change received!', payload);
          fetchTransactions();
        }
      )
      .subscribe((status, err) => {
        console.log("Supabase realtime status:", status, err);
        if (status === 'SUBSCRIBED') {
          setIsLive(true);
          setRealtimeStatus('Live Sync Active');
        } else if (status === 'CHANNEL_ERROR') {
          setIsLive(false);
          setRealtimeStatus('Realtime unavailable');
        } else {
          setIsLive(false);
          setRealtimeStatus(`Status: ${status}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredData = data.filter((t) => {
    const matchesFilter = filter === "ALL" || t.type === filter;
    const matchesSearch = (t.description || "").toLowerCase().includes(search.toLowerCase()) || 
                          (t.category || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openModal = () => {
    setForm({
      type: "EXPENSE",
      category: "Food",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setFormError("");
    setSuccessMsg("");
    setShowModal(true);
  };

  const handleTypeChange = (type) => {
    setForm(prev => ({
      ...prev,
      type,
      category: CATEGORIES[type][0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.description.trim()) {
      setFormError("Description is required.");
      return;
    }
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      setFormError("Enter a valid amount greater than 0.");
      return;
    }
    if (!form.date) {
      setFormError("Date is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const currentToken = token || localStorage.getItem("sf_token") || localStorage.getItem("token");
      const payload = {
        type: form.type,
        category: form.category,
        description: form.description.trim(),
        amount: form.type === "INCOME" ? Math.abs(Number(form.amount)) : -Math.abs(Number(form.amount)),
        date: form.date,
        userId: user?.id || (currentToken ? Number(currentToken) : null),
      };

      await addTransaction(payload);
      collab?.broadcastActivity(`added a ₹${Math.abs(payload.amount).toLocaleString("en-IN")} ${payload.type.toLowerCase()} transaction`, "transaction");
      setSuccessMsg("Transaction added successfully!");
      setTimeout(() => {
        setShowModal(false);
        setSuccessMsg("");
        fetchTransactions();
      }, 800);
    } catch (err) {
      console.error(err);
      setFormError("Failed to add transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 text-white min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Transactions</h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
              <div className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? 'animate-ping bg-green-400' : 'bg-gray-500'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              </div>
              {realtimeStatus}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              id="add-transaction-btn"
              onClick={openModal}
              className="flex-1 sm:flex-none group flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all duration-300 active:scale-95"
            >
              <Plus size={18} />
              Add Entry
            </button>

            <div className="flex gap-1 bg-gray-900/50 p-1 rounded-xl border border-gray-800">
              {["ALL", "INCOME", "EXPENSE"].map((f) => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
                    filter === f 
                      ? f === "INCOME" ? "bg-green-600 text-white" : f === "EXPENSE" ? "bg-red-600 text-white" : "bg-blue-600 text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {f === "ALL" ? "All" : f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-800">
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full rounded-lg transition-colors"
          />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse focus:outline-none">
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
                    <td colSpan="5" className="p-8 text-center text-gray-500 text-sm">No transactions found.</td>
                  </tr>
                ) : (
                  filteredData.map((t) => {
                    const num = Number(t.amount);
                    return (
                      <tr key={t.id} className="hover:bg-gray-800/60 transition-colors">
                        <td className="p-4 text-sm text-gray-300">{t.date}</td>
                        <td className="p-4 text-sm font-medium text-gray-100">{t.description}</td>
                        <td className="p-4 text-sm text-gray-400">
                          <span className="px-2.5 py-1 bg-gray-800 rounded-lg text-xs font-medium border border-gray-700">{t.category}</span>
                        </td>
                        <td className="p-4 text-sm">
                          <span className={`text-xs font-bold tracking-wide px-2 py-1 rounded-md bg-opacity-10 
                            ${num >= 0 ? 'text-green-400 bg-green-900/40' : 'text-red-400 bg-red-900/40'}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className={`p-4 text-sm font-bold text-right tracking-wide ${num >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {num >= 0 ? "+" : "-"} ₹{Math.abs(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden divide-y divide-gray-800">
            {filteredData.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No transactions found.</div>
            ) : (
              filteredData.map((t) => {
                const num = Number(t.amount);
                return (
                  <div key={t.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-100">{t.description}</p>
                        <p className="text-xs text-gray-500">{t.date}</p>
                      </div>
                      <p className={`text-sm font-bold tracking-wide ${num >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {num >= 0 ? "+" : "-"} ₹{Math.abs(num).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 bg-gray-800 rounded-md text-[10px] font-medium border border-gray-700 text-gray-400 uppercase tracking-wider">
                        {t.category}
                      </span>
                      <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-md bg-opacity-10 uppercase
                        ${num >= 0 ? 'text-green-400 bg-green-900/40' : 'text-red-400 bg-red-900/40'}`}>
                        {t.type}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

          {/* Modal */}
          <div className="relative w-full max-w-lg bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/50 animate-[slideUp_0.3s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <IndianRupee size={20} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">New Transaction</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Add an income or expense entry</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Type Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                  <Tag size={14} className="text-gray-500" />
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTypeChange("INCOME")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                      ${form.type === "INCOME"
                        ? "bg-green-500/15 border-2 border-green-500/50 text-green-400 shadow-lg shadow-green-500/10"
                        : "bg-gray-800/50 border-2 border-gray-700/50 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                      }`}
                  >
                    <TrendingUp size={16} />
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange("EXPENSE")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                      ${form.type === "EXPENSE"
                        ? "bg-red-500/15 border-2 border-red-500/50 text-red-400 shadow-lg shadow-red-500/10"
                        : "bg-gray-800/50 border-2 border-gray-700/50 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                      }`}
                  >
                    <TrendingDown size={16} />
                    Expense
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                  <FileText size={14} className="text-gray-500" />
                  Description
                </label>
                <input
                  id="txn-description"
                  type="text"
                  placeholder="e.g. Monthly salary, Groceries purchase"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-800/50 border border-gray-700/50 text-white rounded-xl py-3 px-4 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  autoFocus
                />
              </div>

              {/* Amount + Date row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    <IndianRupee size={14} className="text-gray-500" />
                    Amount (₹)
                  </label>
                  <input
                    id="txn-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-700/50 text-white rounded-xl py-3 px-4 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-gray-500" />
                    Date
                  </label>
                  <input
                    id="txn-date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-gray-800/50 border border-gray-700/50 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                  <Tag size={14} className="text-gray-500" />
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES[form.type].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, category: cat }))}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                        ${form.category === cat
                          ? form.type === "INCOME"
                            ? "bg-green-500/15 border border-green-500/40 text-green-400"
                            : "bg-red-500/15 border border-red-500/40 text-red-400"
                          : "bg-gray-800/50 border border-gray-700/40 text-gray-400 hover:border-gray-600 hover:text-gray-300"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-[fadeIn_0.2s_ease-out]">
                  <X size={14} />
                  {formError}
                </div>
              )}

              {/* Success */}
              {successMsg && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm animate-[fadeIn_0.2s_ease-out]">
                  <TrendingUp size={14} />
                  {successMsg}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-400 bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 hover:text-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  id="txn-submit-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300
                    ${form.type === "INCOME"
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
                      : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Add {form.type === "INCOME" ? "Income" : "Expense"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
