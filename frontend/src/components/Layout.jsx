import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Bot,
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard",    path: "/dashboard",    icon: LayoutDashboard },
  { label: "Transactions", path: "/transactions", icon: ArrowLeftRight  },
  { label: "Forecast",     path: "/forecast",     icon: TrendingUp      },
  { label: "AI Advisor",   path: "/ai-advisor",   icon: Bot             },
];

export default function Layout({ children }) {
  const { logout } = useAuth();          // adjust if your AuthContext exposes a different method
  const location  = useLocation();
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout?.();                          // call AuthContext logout if available
    localStorage.removeItem("token");   // fallback clear
    navigate("/login");
  };

  const NavLinks = ({ onClick }) =>
    NAV_ITEMS.map(({ label, path, icon: Icon }) => {
      const active = location.pathname === path;
      return (
        <Link
          key={path}
          to={path}
          onClick={onClick}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            active
              ? "bg-blue-600/20 text-blue-400"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          }`}
        >
          <Icon size={18} />
          {label}
        </Link>
      );
    });

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 bg-gray-900 border-r border-gray-800 fixed h-full z-20">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-800">
          <Zap size={20} className="text-blue-400" />
          <span className="text-base font-bold tracking-tight">
            SmartFlow <span className="text-blue-400">AI</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          <NavLinks />
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-blue-400" />
          <span className="text-sm font-bold">
            SmartFlow <span className="text-blue-400">AI</span>
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-400 hover:text-white"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute top-14 left-0 right-0 bg-gray-900 border-b border-gray-800 px-4 py-4 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <NavLinks onClick={() => setOpen(false)} />
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* ── Page content ────────────────────────────────────── */}
      <main className="flex-1 md:ml-56 pt-14 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
