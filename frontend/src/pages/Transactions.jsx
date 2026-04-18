import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { getTransactions, addTransaction, deleteTransaction } from "../api/transactions";
import { Trash2 } from "lucide-react";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    type: "EXPENSE"
  });

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      const sorted = (data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();

    const channel = supabase
      .channel("transactions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => fetchTransactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.category) return;

    try {
      await addTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setFormData({ ...formData, amount: "", description: "", category: "" });
      fetchTransactions();
    } catch (err) {
      console.error("Error adding transaction:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await deleteTransaction(id);
      fetchTransactions();
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-8">Transactions</h1>

      {/* Add Transaction Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Add New Transaction</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
            <input 
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
            <input 
              type="text" 
              placeholder="e.g. Salary, Groceries"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
            <input 
              type="text" 
              placeholder="e.g. Food"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-gray-400 mb-1">Amount (₹)</label>
            <input 
              type="number" 
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="md:col-span-6 flex justify-end mt-2">
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-lg"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>

      {/* Transactions Table */}
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
                <th className="p-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 text-sm">
                    No transactions found. Add one above!
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-800/60 transition-colors group">
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
                      {t.type === 'INCOME' ? '+' : '-'} ₹{Number(t.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDelete(t.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2 rounded-md hover:bg-red-400/10"
                        title="Delete transaction"
                      >
                        <Trash2 size={18} className="mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
