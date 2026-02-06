"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { AgentDetail } from "@/components/dashboard/agent-detail";
import { useToast } from "@/components/toast";
import { useRegisterShortcut } from "@/components/shortcuts-provider";
import {
  Bot,
  Plus,
  Link2,
  Wifi,
  WifiOff,
  Zap,
  Activity,
} from "lucide-react";

type Agent = {
  _id: Id<"agents">;
  name: string;
  avatar?: string;
  status: string;
  soul?: string;
  model?: string;
  sessionKey?: string;
  lastSeen: number;
  currentTaskId?: Id<"tasks">;
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

export default function AgentsPage() {
  const agents = useQuery(api.agents.list);
  const tasks = useQuery(api.tasks.list);
  const createAgent = useMutation(api.agents.create);
  const { addToast } = useToast();

  const [filter, setFilter] = useState<FilterTab>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newAvatar, setNewAvatar] = useState("🤖");
  const [newModel, setNewModel] = useState("cerebras/zai-glm-4.7");
  const [isCreating, setIsCreating] = useState(false);

  const openCreate = useCallback(() => setShowCreate(true), []);
  useRegisterShortcut("newAgent", openCreate);

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
      addToast(`Agent "${newName.trim()}" created`, "success");
      setNewName("");
      setNewRole("");
      setNewAvatar("🤖");
      setNewModel("cerebras/zai-glm-4.7");
      setShowCreate(false);
    } catch {
      addToast("Failed to create agent", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const getRole = (soul?: string) => soul?.match(/Role:\s*(.+)/)?.[1];
  const online = agents?.filter((a) => a.status === "online" || a.status === "busy").length ?? 0;
  const busy = agents?.filter((a) => a.status === "busy").length ?? 0;

  // Get current task for an agent
  const getAgentTask = (agentId: Id<"agents">) =>
    tasks?.find((t) => t.assignedAgentId === agentId && (t.status === "running" || t.status === "assigned"));

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-mc-border bg-mc-bg-secondary/50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold">Agents</h1>
            <p className="text-xs text-mc-text-secondary">{agents?.length ?? 0} total · {online} online</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-mc-accent text-white rounded hover:bg-mc-accent/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Agent
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Total Agents"
            value={agents?.length ?? 0}
            icon={<Bot className="w-4 h-4" />}
            accent="blue"
          />
          <StatCard
            label="Online"
            value={online}
            icon={<Wifi className="w-4 h-4" />}
            accent="green"
          />
          <StatCard
            label="Busy"
            value={busy}
            icon={<Activity className="w-4 h-4" />}
            accent="yellow"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1">
          {(["all", "online", "offline"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "px-2.5 py-1 text-xs rounded transition-colors capitalize",
                filter === tab
                  ? "bg-mc-bg-tertiary text-mc-text"
                  : "text-mc-text-secondary hover:text-mc-text"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Agent Grid */}
        {!agents ? (
          <SkeletonList count={5} />
        ) : filtered?.length === 0 ? (
          <EmptyState
            icon={<Bot className="w-10 h-10" />}
            title={filter === "all" ? "No agents yet" : `No ${filter} agents`}
            description="Create an agent to start orchestrating"
            action={{ label: "New Agent", onClick: () => setShowCreate(true) }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered?.map((agent) => {
              const role = getRole(agent.soul);
              const currentTask = getAgentTask(agent._id);
              return (
                <div
                  key={agent._id}
                  onClick={() => setSelectedAgent(agent as Agent)}
                  className="p-4 bg-mc-bg-secondary border border-mc-border rounded-lg hover:border-mc-border/80 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{agent.avatar || "🤖"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{agent.name}</span>
                        {agent.sessionKey && <Link2 className="w-3 h-3 text-mc-accent flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-mc-text-secondary">
                        {role || "No role assigned"}
                      </div>
                    </div>
                    <span className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0 mt-1.5",
                      agent.status === "online" ? "bg-mc-accent-green" :
                      agent.status === "busy" ? "bg-mc-accent-yellow" : "bg-mc-border"
                    )} />
                  </div>

                  {/* Model */}
                  <div className="flex items-center gap-2 text-xs text-mc-text-secondary mb-2">
                    {agent.model?.includes("cerebras") && <Zap className="w-3 h-3 text-mc-accent-yellow" />}
                    <span>{agent.model ? MODEL_OPTIONS.find((m) => m.value === agent.model)?.label ?? agent.model.split("/")[1] : "No model"}</span>
                  </div>

                  {/* Current task */}
                  {currentTask && (
                    <div className="text-xs bg-mc-accent-yellow/10 text-mc-accent-yellow px-2 py-1.5 rounded mb-2 truncate">
                      Working: {currentTask.title}
                    </div>
                  )}

                  {/* Last seen */}
                  <div className="text-xs text-mc-text-secondary/60">
                    {agent.status === "online" || agent.status === "busy"
                      ? "Active now"
                      : `Last seen ${formatTime(agent.lastSeen)}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Agent" size="sm">
        <form onSubmit={handleCreate} className="p-4 space-y-3">
          <div className="flex gap-1.5 flex-wrap">
            {AVATARS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setNewAvatar(e)}
                className={cn(
                  "w-8 h-8 rounded text-base flex items-center justify-center transition-colors",
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
            placeholder="Agent name"
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
            <button type="button" onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-xs text-mc-text-secondary hover:text-mc-text">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newName.trim() || isCreating}
              className="px-4 py-1.5 text-xs bg-mc-accent text-white rounded hover:bg-mc-accent/90 disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Agent"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <AgentDetail agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
    </div>
  );
}
