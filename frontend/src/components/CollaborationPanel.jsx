import { useState } from "react";
import { useCollab } from "../context/CollabContext";
import { useAuth } from "../context/AuthContext";
import { Users, Radio, ChevronDown, ChevronUp, Circle } from "lucide-react";

const PAGE_LABELS = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/forecast": "Forecast",
  "/ai-advisor": "AI Advisor",
};

const ACTIVITY_ICONS = {
  join: "🟢",
  leave: "🔴",
  action: "⚡",
  transaction: "💰",
};

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function CollaborationPanel() {
  const collab = useCollab();
  const { user, login, token } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const [inviteCode, setInviteCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  if (!collab) return null;

  const { onlineUsers, activities, isConnected } = collab;

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setJoinLoading(true);
    setJoinError("");
    try {
      const { joinWorkspace } = await import("../api/auth");
      const updatedUser = await joinWorkspace(inviteCode, user.id);
      if (updatedUser.error) {
        setJoinError(updatedUser.error);
      } else {
        login(token, updatedUser);
        window.location.href = "/dashboard"; // hard reload to fetch new workspace data
      }
    } catch (e) {
      setJoinError("Failed to join workspace.");
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="px-3 pb-3">
      {/* Workspace Management */}
      {expanded && (
        <div className="mb-4 px-3 space-y-3">
          <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">
              Your Team Invite Code
            </p>
            <div className="flex items-center justify-between bg-black/40 px-2 py-1.5 rounded-lg border border-white/5">
              <span className="text-sm font-mono text-emerald-400 font-bold tracking-wider">{user?.inviteCode || "..."}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(user?.inviteCode)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Copy
              </button>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Join a Team</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter Code"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-2 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500"
              />
              <button
                onClick={handleJoin}
                disabled={joinLoading || !inviteCode.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 text-xs font-semibold"
              >
                {joinLoading ? "..." : "Join"}
              </button>
            </div>
            {joinError && <p className="text-[10px] text-red-400">{joinError}</p>}
          </div>
        </div>
      )}

      {/* Connection status */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Radio size={14} className={isConnected ? "text-green-400" : "text-gray-500"} />
          <span>Collaboration</span>
          {onlineUsers.length > 0 && (
            <span className="bg-blue-600/20 text-blue-400 text-xs px-1.5 py-0.5 rounded-full font-semibold">
              {onlineUsers.length}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="mt-1 space-y-3 animate-in slide-in-from-top-2">
          {/* Online users */}
          <div className="px-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Online Now
            </p>
            {onlineUsers.length === 0 ? (
              <p className="text-xs text-gray-600 italic">No one else online</p>
            ) : (
              <div className="space-y-1.5">
                {onlineUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-2 group">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ring-2 ring-gray-900"
                      style={{ backgroundColor: u.color }}
                    >
                      {(u.name || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-300 truncate font-medium">{u.name}</p>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Circle size={4} className="text-green-400 fill-green-400" />
                        {PAGE_LABELS[u.page] || "Browsing"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity feed */}
          {activities.length > 0 && (
            <div className="px-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">
                Recent Activity
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
                {activities.slice(0, 8).map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-[11px] text-gray-400 py-1 animate-in fade-in slide-in-from-left-2"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <span className="shrink-0 mt-0.5">{ACTIVITY_ICONS[a.type] || "⚡"}</span>
                    <span>
                      <span className="font-medium" style={{ color: a.color }}>{a.user}</span>
                      {" "}{a.message}
                    </span>
                    <span className="text-gray-600 ml-auto shrink-0">{timeAgo(a.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
