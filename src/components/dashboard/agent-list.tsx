"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { Plus, X, Link2 } from "lucide-react";
import { AgentDetail } from "./agent-detail";
import { Id } from "../../../convex/_generated/dataModel";
import { useToast } from "@/components/toast";

type Agent = {
  _id: Id<"agents">;
  name: string;
  avatar?: string;
  status: string;
  soul?: string;
  model?: string;
  sessionKey?: string;
};

type FilterTab = "all" | "online" | "offline";

const ROLE_OPTIONS = [
  "Squad Lead", "Product Analyst", "Customer Researcher", "SEO Analyst",
  "Content Writer", "Social Media Manager", "Designer", "Email Marketing",
  "Developer", "Documentation",
];

const MODEL_OPTIONS = [
  { value: "cerebras/zai-glm-4.7", label: "Cerebras" },
  { value: "anthropic/claude-opus-4-5", label: "Opus" },
  { value: "anthropic/claude-sonnet-4-20250514", label: "Sonnet" },
];

const AVATARS = ["🤖", "🦾", "🧠", "👾", "🎯", "⚡", "🔮", "🦊", "🐙", "🌟"];

export function AgentList() {
  const agents = useQuery(api.agents.list);
  const createAgent = useMutation(api.agents.create);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newAvatar, setNewAvatar] = useState("🤖");
  const [newModel, setNewModel] = useState("cerebras/zai-glm-4.7");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const { addToast } = useToast();

  const filtered = agents?.filter((a) => {
    if (filter === "all") return true;
    if (filter === "online") return a.status === "online" || a.status === "busy";
    return a.status === "offline";
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
        model: newModel,
      });
      addToast(`Agent ${newName.trim()} created`, "success");
      setNewName("");
      setNewRole("");
      setNewAvatar("🤖");
      setNewModel("cerebras/zai-glm-4.7");
      setShowModal(false);
    } catch (error) {
      addToast("Failed to create agent", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const getRole = (soul?: string) => soul?.match(/Role:\s*(.+)/)?.[1];
  const online = agents?.filter((a) => a.status === "online" || a.status === "busy").length ?? 0;

  return (
    <>
      <div className="h-full flex flex-col bg-mc-bg-secondary border border-mc-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-2.5 border-b border-mc-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-mc-text-secondary uppercase tracking-wide">
              Agents ({agents?.length ?? 0})
            </span>
            {online > 0 && (
              <span className="text-xs text-mc-accent-green">{online} online</span>
            )}
          </div>
          <div className="flex gap-0.5">
            {(["all", "online", "offline"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "px-2 py-1 text-xs rounded transition-colors",
                  filter === tab
                    ? "bg-mc-bg-tertiary text-mc-text"
                    : "text-mc-text-secondary hover:text-mc-text"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
          {!agents ? (
            <div className="p-2 text-xs text-mc-text-secondary">Loading...</div>
          ) : filtered?.length === 0 ? (
            <div className="p-4 text-xs text-mc-text-secondary text-center">No agents</div>
          ) : (
            filtered?.map((agent) => {
              const role = getRole(agent.soul);
              return (
                <div
                  key={agent._id}
                  onClick={() => setSelectedAgent(agent as Agent)}
                  className="flex items-center gap-2 p-2 rounded hover:bg-mc-bg-tertiary transition-colors cursor-pointer"
                >
                  <span className="text-xl">{agent.avatar || "🤖"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium truncate">{agent.name}</span>
                      {agent.sessionKey && <Link2 className="w-3 h-3 text-mc-accent flex-shrink-0" />}
                    </div>
                    <div className="text-xs text-mc-text-secondary truncate">
                      {role || "—"}
                      {agent.model?.includes("cerebras") && " · ⚡"}
                    </div>
                  </div>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                    agent.status === "online" ? "bg-mc-accent-green" :
                    agent.status === "busy" ? "bg-mc-accent-yellow" : "bg-mc-border"
                  )} />
                </div>
              );
            })
          )}
        </div>

        {/* Add button */}
        <div className="p-2 border-t border-mc-border">
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs text-mc-text-secondary hover:text-mc-text hover:bg-mc-bg-tertiary rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add agent
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-mc-bg-secondary border border-mc-border rounded-lg w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-3 border-b border-mc-border flex items-center justify-between">
              <span className="text-sm font-medium">New Agent</span>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-mc-bg-tertiary rounded">
                <X className="w-4 h-4 text-mc-text-secondary" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-3 space-y-3">
              <div className="flex gap-1.5 flex-wrap">
                {AVATARS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setNewAvatar(e)}
                    className={cn(
                      "w-8 h-8 rounded text-base flex items-center justify-center",
                      newAvatar === e ? "bg-mc-accent/20 ring-1 ring-mc-accent" : "bg-mc-bg hover:bg-mc-bg-tertiary"
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name"
                className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-mc-accent"
                autoFocus
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-mc-accent"
              >
                <option value="">Role...</option>
                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-mc-accent"
              >
                {MODEL_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs text-mc-text-secondary hover:text-mc-text">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || isCreating}
                  className="px-3 py-1.5 text-xs bg-mc-accent text-white rounded hover:bg-mc-accent/90 disabled:opacity-50"
                >
                  {isCreating ? "..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <AgentDetail agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
    </>
  );
}
