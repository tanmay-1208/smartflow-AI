import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser, googleLogin } from "../api/auth";
import { GoogleLogin } from '@react-oauth/google';
export default function Login() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ email: "", password: "", businessName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = mode === "login"
        ? await loginUser({ email: form.email, password: form.password })
        : await registerUser(form);

      if (res.id) {
        login(String(res.id), res);
        navigate("/dashboard");
      } else {
        setError(res.message || "Something went wrong");
      }
    } catch {
      setError("Could not connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const res = await googleLogin(credentialResponse.credential);
      if (res.id) {
        login(String(res.id), res);
        navigate("/dashboard");
      } else {
        setError(res.error || res.message || "Google Sign-In failed on server");
      }
    } catch {
      setError("Could not connect to server during Google Sign-In.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-saffron-400/5 pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-emerald-500/5 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-saffron-500 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#0B1426" strokeWidth="2.5">
                <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-100 tracking-tight font-display">
              SmartFlow
            </span>
          </div>
          <p className="text-sm text-slate-500">AI-powered cash flow for Indian SMBs</p>
        </div>

        {/* Card */}
        <div className="bg-navy-800 border border-white/[0.07] rounded-2xl p-5 sm:p-7 mb-4">
          {/* Tab toggle */}
          <div className="flex bg-navy-900 rounded-lg p-1 mb-6">
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${
                  mode === m
                    ? "bg-navy-700 text-saffron-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {m === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          {/* Fields */}
          {mode === "register" && (
            <div className="mb-4">
              <label className="block text-xs text-slate-400 font-medium mb-1.5 tracking-wider uppercase">
                Business Name
              </label>
              <input
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                placeholder="Sharma Traders"
                className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-saffron-500/50 transition-colors"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs text-slate-400 font-medium mb-1.5 tracking-wider uppercase">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@business.com"
              className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-saffron-500/50 transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs text-slate-400 font-medium mb-1.5 tracking-wider uppercase">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              className="w-full bg-navy-900 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-saffron-500/50 transition-colors"
            />
          </div>

          {error && (
            <div className="mb-4 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-saffron-500 hover:bg-saffron-400 disabled:opacity-50 rounded-lg py-2.5 text-sm font-semibold text-navy-900 transition-colors"
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign in to SmartFlow" : "Create account"}
          </button>

          <div className="mt-4 flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative px-4 text-xs text-slate-500 bg-navy-800">
              Or continue with
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Sign-In failed.")}
              useOneTap
              theme="filled_black"
              shape="rectangular"
              text="continue_with"
            />
          </div>
        </div>

        <p className="text-center text-xs text-slate-600">Secured with JWT · Data stays in India</p>
      </div>
    </div>
  );
}