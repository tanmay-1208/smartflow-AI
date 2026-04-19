import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("sf_token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("sf_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (tok, userData) => {
    localStorage.setItem("sf_token", tok);
    localStorage.setItem("sf_user", JSON.stringify(userData));
    setToken(tok);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("sf_token");
    localStorage.removeItem("sf_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
