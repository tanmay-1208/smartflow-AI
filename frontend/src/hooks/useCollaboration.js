import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

/**
 * Real-time collaboration hook using Supabase Presence + Broadcast.
 * Tracks online users and broadcasts activity events across the app.
 */
export function useCollaboration() {
  const { user, token } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [channel, setChannel] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const userName = user?.name || user?.businessName || user?.email || "User";
    const userColor = generateColor(token);

    const ch = supabase.channel(`workspace-${user?.workspaceId || token}`, {
      config: { presence: { key: token } },
    });

    // Track presence (who's online)
    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState();
      const users = Object.entries(state).map(([key, presences]) => ({
        id: key,
        ...presences[0],
      }));
      setOnlineUsers(users);
    });

    ch.on("presence", { event: "join" }, ({ newPresences }) => {
      newPresences.forEach((p) => {
        if (p.user_id !== token) {
          addActivity({
            type: "join",
            user: p.name,
            color: p.color,
            message: "came online",
            timestamp: Date.now(),
          });
        }
      });
    });

    ch.on("presence", { event: "leave" }, ({ leftPresences }) => {
      leftPresences.forEach((p) => {
        addActivity({
          type: "leave",
          user: p.name,
          color: p.color,
          message: "went offline",
          timestamp: Date.now(),
        });
      });
    });

    // Broadcast events (actions like adding transactions)
    ch.on("broadcast", { event: "activity" }, ({ payload }) => {
      if (payload.user_id !== token) {
        addActivity(payload);
      }
    });

    ch.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        await ch.track({
          user_id: token,
          name: userName,
          color: userColor,
          page: window.location.pathname,
          online_at: new Date().toISOString(),
        });
      } else {
        setIsConnected(false);
      }
    });

    setChannel(ch);

    // Update presence when page changes
    const handlePageChange = () => {
      if (ch) {
        ch.track({
          user_id: token,
          name: userName,
          color: userColor,
          page: window.location.pathname,
          online_at: new Date().toISOString(),
        });
      }
    };

    window.addEventListener("popstate", handlePageChange);

    return () => {
      window.removeEventListener("popstate", handlePageChange);
      supabase.removeChannel(ch);
    };
  }, [token, user]);

  const addActivity = useCallback((activity) => {
    setActivities((prev) => [activity, ...prev].slice(0, 20));
  }, []);

  // Broadcast an action to all connected users
  const broadcastActivity = useCallback(
    (message, type = "action") => {
      if (!channel) return;
      const userName = user?.name || user?.businessName || user?.email || "User";
      const payload = {
        type,
        user: userName,
        user_id: token,
        color: generateColor(token),
        message,
        timestamp: Date.now(),
      };
      channel.send({ type: "broadcast", event: "activity", payload });
      addActivity(payload);
    },
    [channel, user, token, addActivity]
  );

  return { onlineUsers, activities, isConnected, broadcastActivity };
}

function generateColor(id) {
  const colors = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#a855f7",
  ];
  const num = String(id).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[num % colors.length];
}
