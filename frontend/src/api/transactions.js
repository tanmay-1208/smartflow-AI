const API_URL = import.meta.env.VITE_API_URL;

export const getTransactions = async () => {
    const res = await fetch(`${API_URL}/api/transactions`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    if (!res.ok) {
        throw new Error('Failed to fetch transactions');
    }

    return res.json();
};
