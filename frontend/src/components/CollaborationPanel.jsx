import { useState } from "react";
import { useCollab } from "../context/CollabContext";
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
  const [expanded, setExpanded] = useState(true);

  if (!collab) return null;

  const { onlineUsers, activities, isConnected } = collab;

  return (
    <div className="px-3 pb-3">
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
