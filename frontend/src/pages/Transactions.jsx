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
      .channel('transactions')
      .on(
        'postgres_changes',
        { event: '*', schema        { event: '*', schema        { event: '*', schema        { event: '*', sche   .subscribe();

    return () => {
      supa      supa      supa      supa      supa    ;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.category) return;

    try {
      await addTran      await addTran      await addTran      await addToat(formData.amount)
      });
      setFormDat      setrmData, amount: "", description: "", category: "" });
      fetchTransactio      fetchTransacter      fetchTonsole.error("E      fetchTransactio      fetchTransact };

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
      <h1 className=      <h1 className=      <h1 className=      <h1 className=      <h1 className=      <h1 className=      <h1 className=     er-      <h1 classNaxl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Add New Transac        <h2 classNamorm onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-g        mb-1">Date</label>
            <input 
              type="date" 
              v              v              v              v              v              v              v              v           className="w-full bg-gray-800 border               v              v              v              v              v         50                 required
            />
          </div>
          <div          <div    -s          <div          <div    -s          <div       t-    um text-gray-400 mb-1">Description</label>
            <input 
              type="text" 
              placeholder="e.g. Salary, Groceries"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div          <div          <div          <div          <div          <div          <div   t-          <div    eg          <div          <input 
              type="text" 
              placeholder="e.g. Food"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className="block te            <label classNay            <label className="block te                         <label className="block te                 <label className="block te            <label classNay                 classN            <label className="block te            <label classNay            <label className="block te                         <label cla         >
              <option value="EXPENSE">Expense<              <option value="EXPENSE">Expense<              <option value="EXPENSE">Expense<              <option value="EXPENSE">Exp-span-1">
                                     ext-xs font-medium text-gray-400 mb-1">A                                     e 
              type="number" 
              step="0.01"
              placeholder="0.0              placeholder="0.0              placeholder="0.0              placeholder="0.0              placeholder="0.0              placcl              placegray-800 border bor              punded-lg px-3 py-2.5 text-sm focus:outline-n              placeholder="0.0              placeholder="0.0              placeholder="0.0              placeholder="0.0              placeholder="0.0              placcl              placegray-800 border bor              punded-lg px-3 py-2.5 text-sm focus:outline-n              placeholder="0.0              placeholder="0.0              placeholde     >
              Add Transaction
                                                                                                                                                                                                   ">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
                                      cl                        bo                                      cl                        bo                                      cl                        bo                                      cl                        bo                                      cl                        bo                                      cl                        bo                                      cl                        bo                                      cl                        bo                                      cl                        bo                                      cl                        bo                        <tr>
                              "6" className="p-8 text-center text-gray-500 text-sm">
                    No transactions found. Add one above!
                  </td>
                </tr>
              ) : (
                trans                trans                tratr                trans                trans                tra g                trans                trans                tratr                trans                trans                tra g                trans                trans                tratr                trans                trans                tra g                trans                trans                tratr                trans                trans                tra g                trans                trans                tratr                trans                trans                tra g                trans                trans                tratr                trans                trans                tra g                trans                trans                :                trans                trans                tratr                tran                  trans                trans              td className={`p-4 text-sm font-bold text-right tracking-wide
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
