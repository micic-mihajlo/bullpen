"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { StatusBadge, StatusDot } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { ChevronRight, Plus, X, Link2 } from "lucide-react";

type FilterTab = "all" | "online" | "offline";

const AVATAR_OPTIONS = ["🤖", "🦾", "🧠", "👾", "🎯", "⚡", "🔮", "🦊", "🐙", "🌟"];
const ROLE_OPTIONS = [
  "Squad Lead",
  "Product Analyst", 
  "Customer Researcher",
  "SEO Analyst",
  "Content Writer",
  "Social Media Manager",
  "Designer",
  "Email Marketing",
  "Developer",
  "Documentation",
];

export function AgentList() {
  const agents = useQuery(api.agents.list);
  const createAgent = useMutation(api.agents.create);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newAvatar, setNewAvatar] = useState("🤖");
  const [isCreating, setIsCreating] = useState(false);

  const filteredAgents = agents?.filter((agent) => {
    if (filter === "all") return true;
    if (filter === "online") return agent.status === "online" || agent.status === "busy";
    return agent.status === "offline";
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setIsCreating(true);
    try {
      await createAgent({ 
        name: newName.trim(), 
        avatar: newAvatar,
        soul: newRole ? `Role: ${newRole}` : undefined,
      });
      setNewName("");
      setNewRole("");
      setNewAvatar("🤖");
      setShowModal(false);
    } finally {
      setIsCreating(false);
    }
  };

  const onlineCount = agents?.filter((a) => a.status === "online" || a.status === "busy").length ?? 0;

  // Extract role from soul string
  const getRole = (soul?: string) => {
    if (!soul) return null;
    const match = soul.match(/Role:\s*(.+)/);
    return match ? match[1] : null;
  };

  return (
    <>
      <aside className="h-full bg-mc-bg-secondary border border-mc-border rounded-xl flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-mc-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-mc-text-secondary" />
              <span className="text-sm font-medium uppercase tracking-wider">Agents</span>
              <span className="bg-mc-bg-tertiary text-mc-text-secondary text-xs px-2 py-0.5 rounded">
                {agents?.length ?? 0}
              </span>
            </div>
            {onlineCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-mc-accent-green">
                <StatusDot status="online" />
                {onlineCount} online
              </span>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1">
            {(["all", "online", "offline"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "px-3 py-1 text-xs rounded uppercase transition-colors",
                  filter === tab
                    ? "bg-mc-accent text-mc-bg font-medium"
                    : "text-mc-text-secondary hover:bg-mc-bg-tertiary"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Agent List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {!agents ? (
            <div className="space-y-2 p-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-mc-bg-tertiary/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredAgents?.length === 0 ? (
            <div className="text-center py-8 text-mc-text-secondary text-sm">
              No agents found
            </div>
          ) : (
            filteredAgents?.map((agent) => {
              const role = getRole(agent.soul);
              return (
                <div
                  key={agent._id}
                  className={cn(
                    "w-full rounded-lg hover:bg-mc-bg-tertiary transition-colors cursor-pointer",
                    "animate-slide-in"
                  )}
                >
                  <div className="flex items-center gap-3 p-2">
                    {/* Avatar */}
                    <div className="text-2xl relative flex-shrink-0">
                      {agent.avatar || "🤖"}
                      {agent.status === "online" && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-mc-accent-green rounded-full border-2 border-mc-bg-secondary" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{agent.name}</span>
                        {agent.sessionKey && (
                          <Link2 className="w-3 h-3 text-mc-accent" title="Linked to OpenClaw" />
                        )}
                      </div>
                      <div className="text-xs text-mc-text-secondary truncate">
                        {role || (agent.currentTaskId ? "Working on task" : "Idle")}
                      </div>
                    </div>

                    {/* Status */}
                    <StatusBadge status={agent.status} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Agent Button */}
        <div className="p-3 border-t border-mc-border">
          <button
            onClick={() => setShowModal(true)}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-3 py-2",
              "bg-mc-bg-tertiary hover:bg-mc-border rounded-lg",
              "text-sm text-mc-text-secondary hover:text-mc-text transition-colors"
            )}
          >
            <Plus className="w-4 h-4" />
            Add Agent
          </button>
        </div>
      </aside>

      {/* Create Agent Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-mc-bg-secondary border border-mc-border rounded-xl w-full max-w-md animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-mc-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add New Agent</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-mc-bg-tertiary rounded transition-colors"
              >
                <X className="w-5 h-5 text-mc-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-4 space-y-4">
              {/* Avatar selector */}
              <div>
                <label className="block text-sm font-medium mb-2 text-mc-text-secondary uppercase tracking-wider">
                  Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewAvatar(emoji)}
                      className={cn(
                        "w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all",
                        newAvatar === emoji
                          ? "bg-mc-accent/20 border-2 border-mc-accent scale-110"
                          : "bg-mc-bg border border-mc-border hover:border-mc-accent/50"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name input */}
              <div>
                <label className="block text-sm font-medium mb-2 text-mc-text-secondary uppercase tracking-wider">
                  Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Jarvis, Shuri, Loki"
                  className={cn(
                    "w-full bg-mc-bg border border-mc-border rounded-lg px-4 py-2",
                    "focus:outline-none focus:border-mc-accent",
                    "placeholder:text-mc-text-secondary/50"
                  )}
                  autoFocus
                />
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium mb-2 text-mc-text-secondary uppercase tracking-wider">
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className={cn(
                    "w-full bg-mc-bg border border-mc-border rounded-lg px-4 py-2",
                    "focus:outline-none focus:border-mc-accent"
                  )}
                >
                  <option value="">Select a role...</option>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-mc-text-secondary hover:text-mc-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || isCreating}
                  className={cn(
                    "px-6 py-2 bg-mc-accent text-mc-bg rounded-lg font-medium",
                    "hover:bg-mc-accent/90 disabled:opacity-50 transition-colors"
                  )}
                >
                  {isCreating ? "Creating..." : "Create Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
