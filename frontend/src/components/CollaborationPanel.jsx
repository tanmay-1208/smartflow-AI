import { useState, useEffect } from "react";
import { useCollab } from "../context/CollabContext";
import { useAuth } from "../context/AuthContext";
import { Users, Radio, ChevronDown, ChevronUp, Circle, Copy, UserPlus, LogOut, Crown, Check } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

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
  const { token } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [inviteInput, setInviteInput] = useState("");
  const [teamName, setTeamName] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchTeam = async () => {
    try {
      const res = await fetch(`${API}/api/teams/me`, {
        headers: { "X-User-Id": token },
      });
      const data = await res.json();
      setTeam(data);
    } catch {
      setTeam({ hasTeam: false });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchTeam();
  }, [token]);

  const createTeam = async () => {
    if (!teamName.trim()) return;
    setMessage("");
    try {
      const res = await fetch(`${API}/api/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": token },
        body: JSON.stringify({ name: teamName }),
      });
      const data = await res.json();
      if (data.error) { setMessage(data.error); return; }
      setMessage("Team created!");
      collab?.broadcastActivity(`created team "${teamName}"`, "action");
      setShowCreate(false);
      setTeamName("");
      fetchTeam();
    } catch { setMessage("Failed to create team"); }
  };

  const joinTeam = async () => {
    if (!inviteInput.trim()) return;
    setMessage("");
    try {
      const res = await fetch(`${API}/api/teams/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": token },
        body: JSON.stringify({ inviteCode: inviteInput }),
      });
      const data = await res.json();
      if (data.error) { setMessage(data.error); return; }
      setMessage(`Joined: ${data.teamName}`);
      collab?.broadcastActivity(`joined the team`, "join");
      setShowJoin(false);
      setInviteInput("");
      fetchTeam();
    } catch { setMessage("Failed to join team"); }
  };

  const leaveTeam = async () => {
    try {
      await fetch(`${API}/api/teams/leave`, {
        method: "POST",
        headers: { "X-User-Id": token },
      });
      collab?.broadcastActivity("left the team", "leave");
      fetchTeam();
    } catch {}
  };

  const copyCode = () => {
    navigator.clipboard.writeText(team?.inviteCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!collab || !token) return null;

  const { onlineUsers, activities, isConnected } = collab;

  return (
    <div className="px-3 pb-3">
      {/* Header */}
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
        <div className="mt-1 space-y-3">
          {/* Team Section */}
          <div className="px-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">
              Team
            </p>

            {loading ? (
              <p className="text-xs text-gray-500">Loading...</p>
            ) : team?.hasTeam ? (
              <div className="space-y-2">
                {/* Team info */}
                <div className="bg-gray-800/50 rounded-lg p-2.5">
                  <p className="text-xs font-semibold text-gray-200">{team.teamName}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <code className="text-[10px] bg-gray-900 text-blue-400 px-2 py-0.5 rounded font-mono tracking-wider">
                      {team.inviteCode}
                    </code>
                    <button
                      onClick={copyCode}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Copy invite code"
                    >
                      {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Team members */}
                <div className="space-y-1">
                  {team.members?.map((m) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white">
                        {(m.name || m.email || "?")[0].toUpperCase()}
                      </div>
                      <span className="text-[11px] text-gray-300 truncate flex-1">
                        {m.name || m.email}
                      </span>
                      {m.isOwner && <Crown size={10} className="text-amber-400" />}
                    </div>
                  ))}
                </div>

                {/* Leave button */}
                {!team.isOwner && (
                  <button
                    onClick={leaveTeam}
                    className="flex items-center gap-1.5 text-[11px] text-red-400 hover:text-red-300 transition-colors mt-1"
                  >
                    <LogOut size={10} /> Leave Team
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {/* No team - show create/join */}
                {!showCreate && !showJoin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowCreate(true); setShowJoin(false); setMessage(""); }}
                      className="flex-1 text-[11px] py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors font-medium"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => { setShowJoin(true); setShowCreate(false); setMessage(""); }}
                      className="flex-1 text-[11px] py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-1"
                    >
                      <UserPlus size={10} /> Join
                    </button>
                  </div>
                )}

                {/* Create team form */}
                {showCreate && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Team name"
                      className="w-full text-xs bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                      <button onClick={createTeam} className="flex-1 text-[11px] py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 font-medium">
                        Create
                      </button>
                      <button onClick={() => setShowCreate(false)} className="text-[11px] py-1.5 px-2 rounded-lg text-gray-400 hover:text-white">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Join team form */}
                {showJoin && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={inviteInput}
                      onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
                      placeholder="Enter invite code"
                      maxLength={6}
                      className="w-full text-xs bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 font-mono tracking-widest text-center uppercase"
                    />
                    <div className="flex gap-2">
                      <button onClick={joinTeam} className="flex-1 text-[11px] py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-500 font-medium">
                        Join
                      </button>
                      <button onClick={() => setShowJoin(false)} className="text-[11px] py-1.5 px-2 rounded-lg text-gray-400 hover:text-white">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {message && (
                  <p className={`text-[11px] ${message.includes("error") || message.includes("Failed") || message.includes("already") ? "text-red-400" : "text-green-400"}`}>
                    {message}
                  </p>
                )}
              </div>
            )}
          </div>

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
                  <div key={u.id} className="flex items-center gap-2">
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
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {activities.slice(0, 6).map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-gray-400 py-0.5">
                    <span className="shrink-0">{ACTIVITY_ICONS[a.type] || "⚡"}</span>
                    <span className="flex-1">
                      <span className="font-medium" style={{ color: a.color }}>{a.user}</span>
                      {" "}{a.message}
                    </span>
                    <span className="text-gray-600 shrink-0">{timeAgo(a.timestamp)}</span>
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
