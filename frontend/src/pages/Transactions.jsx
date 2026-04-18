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
    } catch (err)    } catch (err)    } catch (err)
  };


 };
 catch (err)    } catch (ransaction catch (err)    } catch (ransaction catch hannel = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {        {        {        {        {    ra        s'        {        {        {        {        {    ra .subscribe();

    return () => {
      setIsLive(false);
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredData = data.filter((t) => {
    const matchesFilter = filter === "ALL" || t.type === filter    const matchesFilter = filter === "ALcription?.toL werCase()    const matchesFilter = filter === "ALL" || t.type to    const matchesFilter = filter ==Case());
    const matchesFilter  &&    const matchesFilter  &&    co
    <div className="p-6 text-white min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        
                            di                            di                            di        be                         s-                            di                    ont-bold flex                            di                            di                            di   lassName="flex items-center gap-1 text-xs fo                          g-                            di                            di                            di        be                         ame="animate-ping abso                   full                             di       ity-75"><   an>
                  <span className="relative inli                  <span className="relative inli                  <span className="relative inli                  <span className="relative inli                  <span className="relative inli                  <span classNa-c                  <span className="relative inli           de                  <span className="relative inl <div className="flex gap-2">
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
            </butto            </butto            </butto            </butto            </butto            </butto            </butto            </butto            </butto            </butto            </butto            </butto            </butto            </butto            </butto            </butto            </butto            </butto            </butto            </butto            </butto            </butto          y             </buttogo            </butto            </butto        o            </butto            </butto            </butto            </butto            </butto            </butto            </butto            </butto            </butto        e             -blue-500 w-full sm:w-64 transition-colors"
          />
                                                      ssName="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collaps                          <table          <tr className="bg-gray-950 border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
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
                                                                                                                                                m = Number(t.amount);
                    const sign = num >= 0 ? "+" : "-";
                    return (
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
                            ${num >= 0 ? 'text-green-400 bg-green-900/40' : 'text-red-400 bg-red-900/40'}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className={`p-4 text-sm font-bold text-right tracking-wide
                          ${num >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {sign} ₹{Math.abs(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
