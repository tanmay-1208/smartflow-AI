import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("sf_token"));
  const [user, setUser] = useState(null);

  const login = (tok, userData) => {
    localStorage.setItem("sf_token", tok);
    setToken(tok);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("sf_token");
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