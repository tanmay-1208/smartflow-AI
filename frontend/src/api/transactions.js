const BASE = import.meta.env.VITE_API_URL || "";

const headers = () => {
  const token = localStorage.getItem("sf_token") || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-User-Id": token,
  };
};

export const getTransactions = () =>
  fetch(`${BASE}/api/transactions`, { headers: headers() })
    .then((r) => {
      if (!r.ok) throw new Error("Failed to fetch transactions");
      return r.json();
    });

export const addTransaction = (data) =>
  fetch(`${BASE}/api/transactions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const deleteTransaction = (id) =>
  fetch(`${BASE}/api/transactions/${id}`, {
    method: "DELETE",
    headers: headers(),
  }).then((r) => {
    if (!r.ok) throw new Error("Failed to delete transaction");
    return r.text().then(text => text ? JSON.parse(text) : {});
  });
