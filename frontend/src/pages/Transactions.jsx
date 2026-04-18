import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { getTransactions } from "../api/transactions";

export default function Transactions() {
  const [data, setData] = useState([]);

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions();
      setData(res || []);
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
        (payload) => {
          console.log("Change received!", payload);
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      {data.length > 0 ? (
        <ul>
          {data.map((t, idx) => (
            <li key={t.id || idx}>{JSON.stringify(t)}</li>
          ))}
        </ul>
      ) : (
        <p>No transactions yet or loading...</p>
      )}
    </div>
  );
}
