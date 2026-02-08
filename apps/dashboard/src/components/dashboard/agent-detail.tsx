"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import {
  X,
  Send,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Shield,
  Link2,
  Trash2,
  Save,
  Plus,
} from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { useToast } from "@/components/toast";

// ─── Types ───────────────────────────────────────────────────

interface Skill {
  name: string;
  category: string;
  level: "learning" | "proficient" | "expert";
}

interface Agent {
  _id: Id<"agents">;
  name: string;
  avatar?: string;
  status: "online" | "offline" | "busy";
  role?: string;
  soul?: string;
  model?: string;
  modelFallback?: string;
  thinkingLevel?: "none" | "low" | "medium" | "high";
  skills?: Skill[];
  tags?: string[];
  toolGroups?: string[];
  sessionKey?: string;
  channel?: string;
  lastSeen: number;
  currentTaskId?: Id<"tasks">;
  tasksCompleted?: number;
  tasksSuccessRate?: number;
  avgTaskDurationMs?: number;
  openclawId?: string;
}

interface Message {
  role: string;
  content: string;
  timestamp?: number;
}

interface AgentDetailProps {
  agent: Agent;
  onClose: () => void;
}

// ─── Constants ───────────────────────────────────────────────

type TabId = "overview" | "skills" | "activity" | "config";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "skills", label: "Skills" },
  { id: "activity", label: "Activity" },
  { id: "config", label: "Config" },
];

const levelColors: Record<string, string> = {
  learning: "bg-mc-accent-cyan/15 text-mc-accent-cyan border-mc-accent-cyan/30",
  proficient: "bg-mc-accent-green/15 text-mc-accent-green border-mc-accent-green/30",
  expert: "bg-mc-accent/15 text-mc-accent border-mc-accent/30",
};

const levelLabels: Record<string, string> = {
  learning: "Learning",
  proficient: "Proficient",
  expert: "Expert",
};

const categoryColors: Record<string, string> = {
  technical: "text-mc-accent-cyan",
  creative: "text-mc-accent-purple",
  analytical: "text-mc-accent-yellow",
  communication: "text-mc-accent-green",
};

const MODEL_OPTIONS = [
  { value: "cerebras/zai-glm-4.7", label: "Cerebras", icon: "⚡" },
  { value: "anthropic/claude-opus-4-5", label: "Opus", icon: "🧠" },
  { value: "anthropic/claude-sonnet-4-20250514", label: "Sonnet", icon: "💎" },
  { value: "openai/gpt-5.2-mini", label: "GPT-5.2 Mini", icon: "🟢" },
];

const TOOL_GROUPS = [
  { id: "fs", label: "File System" },
  { id: "runtime", label: "Runtime" },
  { id: "sessions", label: "Sessions" },
  { id: "memory", label: "Memory" },
  { id: "ui", label: "Browser/UI" },
  { id: "automation", label: "Automation" },
];

const SKILL_CATALOG: { name: string; category: string }[] = [
  { name: "coding", category: "technical" },
  { name: "debugging", category: "technical" },
  { name: "architecture", category: "technical" },
  { name: "devops", category: "technical" },
  { name: "database", category: "technical" },
  { name: "api-design", category: "technical" },
  { name: "copywriting", category: "creative" },
  { name: "editing", category: "creative" },
  { name: "ui-design", category: "creative" },
  { name: "branding", category: "creative" },
  { name: "storytelling", category: "creative" },
  { name: "research", category: "analytical" },
  { name: "data-analysis", category: "analytical" },
  { name: "market-analysis", category: "analytical" },
  { name: "reporting", category: "analytical" },
  { name: "strategy", category: "analytical" },
  { name: "seo", category: "communication" },
  { name: "social-media", category: "communication" },
  { name: "email-marketing", category: "communication" },
  { name: "documentation", category: "communication" },
  { name: "presentations", category: "communication" },
];

const THINKING_LEVELS = [
  { value: "none", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

const eventIcons: Record<string, string> = {
  task_created: "+",
  task_assigned: "→",
  task_started: "▶",
  task_completed: "✓",
  task_failed: "✗",
  status_change: "•",
  session_linked: "⚡",
  agent_created: "★",
};

// ─── Helpers ─────────────────────────────────────────────────

function getModelLabel(model?: string) {
  if (!model) return "Default model";
  return MODEL_OPTIONS.find((m) => m.value === model)?.label ?? model.split("/")[1] ?? model;
}

function getModelIcon(model?: string) {
  return MODEL_OPTIONS.find((m) => m.value === model)?.icon ?? null;
}

function getRole(agent: Agent) {
  if (agent.role) return agent.role;
  return agent.soul?.match(/Role:\s*(.+)/)?.[1] ?? null;
}

function formatDuration(ms: number) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(0)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

// ─── Component ───────────────────────────────────────────────

export function AgentDetail({ agent, onClose }: AgentDetailProps) {
  const [tab, setTab] = useState<TabId>("overview");
  const { addToast } = useToast();

  // Live data
  const agentData = useQuery(api.agents.getWithMetrics, { id: agent._id });
  const activity = useQuery(api.agents.getActivity, { agentId: agent._id, limit: 30 });
  const taskHistory = useQuery(api.agents.getTaskHistory, { agentId: agent._id, limit: 20 });

  // Mutations
  const updateAgent = useMutation(api.agents.update);
  const removeAgent = useMutation(api.agents.remove);

  // Session state
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Config editing state
  const [editingSoul, setEditingSoul] = useState(false);
  const [soulDraft, setSoulDraft] = useState(agent.soul || "");
  const [savingSoul, setSavingSoul] = useState(false);

  // Skill editing state
  const [addingSkills, setAddingSkills] = useState(false);
  const [pendingSkills, setPendingSkills] = useState<Skill[]>(agent.skills ?? []);
  const [savingSkills, setSavingSkills] = useState(false);

  // Config field editing state
  const [editingConfig, setEditingConfig] = useState(false);
  const [configThinking, setConfigThinking] = useState(agent.thinkingLevel ?? "none");
  const [configToolGroups, setConfigToolGroups] = useState<string[]>(agent.toolGroups ?? []);
  const [configModelFallback, setConfigModelFallback] = useState(agent.modelFallback ?? "");
  const [savingConfig, setSavingConfig] = useState(false);

  const liveAgent = agentData ? { ...agent, ...agentData } : agent;
  const metrics = agentData?.computedMetrics;
  const role = getRole(liveAgent);

  // Fetch session history
  const sessionKey = liveAgent.sessionKey;
  const fetchHistory = useCallback(async () => {
    if (!sessionKey) return;
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/openclaw/sessions/${encodeURIComponent(sessionKey)}/history`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } finally {
      setLoadingMessages(false);
    }
  }, [sessionKey]);

  useEffect(() => {
    if (sessionKey && tab === "overview") {
      fetchHistory();
    }
  }, [sessionKey, tab, fetchHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !liveAgent.sessionKey) return;
    setSending(true);
    try {
      const res = await fetch(`/api/openclaw/sessions/${encodeURIComponent(liveAgent.sessionKey)}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      if (res.ok) {
        setNewMessage("");
        await fetchHistory();
      }
    } finally {
      setSending(false);
    }
  };

  const handleSaveSoul = async () => {
    setSavingSoul(true);
    try {
      await updateAgent({ id: agent._id, soul: soulDraft });
      setEditingSoul(false);
      addToast("Soul updated", "success");
    } catch {
      addToast("Failed to update", "error");
    } finally {
      setSavingSoul(false);
    }
  };

  const handleSaveSkills = async () => {
    setSavingSkills(true);
    try {
      await updateAgent({ id: agent._id, skills: pendingSkills });
      setAddingSkills(false);
      addToast("Skills updated", "success");
    } catch {
      addToast("Failed to update skills", "error");
    } finally {
      setSavingSkills(false);
    }
  };

  const togglePendingSkill = (name: string, category: string) => {
    setPendingSkills((prev) => {
      const exists = prev.find((s) => s.name === name);
      if (exists) return prev.filter((s) => s.name !== name);
      return [...prev, { name, category, level: "proficient" as const }];
    });
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await updateAgent({
        id: agent._id,
        thinkingLevel: configThinking as "none" | "low" | "medium" | "high",
        toolGroups: configToolGroups,
        modelFallback: configModelFallback || undefined,
      });
      setEditingConfig(false);
      addToast("Config updated", "success");
    } catch {
      addToast("Failed to update config", "error");
    } finally {
      setSavingConfig(false);
    }
  };

  const toggleConfigToolGroup = (id: string) => {
    setConfigToolGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await removeAgent({ id: agent._id });
      addToast(`Agent "${liveAgent.name}" removed`, "success");
      onClose();
    } catch {
      addToast("Failed to remove agent", "error");
    } finally {
      setConfirmDelete(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label={`Agent detail: ${liveAgent.name}`} onClick={onClose}>
      <div
        className="bg-mc-bg-secondary border border-mc-border rounded-lg w-full max-w-3xl max-h-[85vh] flex flex-col shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ede6] bg-white">
          <div className="text-[13px] font-semibold text-[#1a1a1a] flex items-center gap-3 flex-1">
            <span className="text-2xl">{liveAgent.avatar || "🤖"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[#ddd]">{liveAgent.name}</span>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  liveAgent.status === "online" ? "bg-mc-accent-green" :
                  liveAgent.status === "busy" ? "bg-mc-accent-yellow" : "bg-[#555]"
                )} />
                {liveAgent.sessionKey && <Link2 className="w-3 h-3 text-mc-accent" />}
              </div>
              <div className="text-[10px] text-[#888] font-mono-jb uppercase tracking-wider flex items-center gap-2">
                <span>{role || "Agent"}</span>
                {liveAgent.model && (
                  <>
                    <span className="text-[#555]">·</span>
                    <span>{getModelIcon(liveAgent.model)} {getModelLabel(liveAgent.model)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded ml-auto transition-colors">
            <X className="w-5 h-5 text-[#666]" />
          </button>
        </div>

        {/* ─── Tabs ─── */}
        <div className="flex border-b border-mc-border bg-mc-bg-tertiary/30">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-4 py-2 text-[10px] font-mono-jb uppercase tracking-wider transition-colors relative",
                tab === t.id
                  ? "text-mc-accent"
                  : "text-mc-text-secondary hover:text-mc-text"
              )}
            >
              {t.label}
              {tab === t.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-mc-accent" />
              )}
            </button>
          ))}
        </div>

        {/* ─── Tab Content ─── */}
        <div className="flex-1 overflow-y-auto">
          {/* ════════ OVERVIEW ════════ */}
          {tab === "overview" && (
            <div className="p-4 space-y-4">
              {/* Metrics Row */}
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-mc-bg border border-mc-border rounded p-2 text-center">
                  <div className="text-lg font-mono-jb font-medium text-mc-accent">{metrics?.completedTasks ?? liveAgent.tasksCompleted ?? 0}</div>
                  <div className="text-[9px] text-mc-muted font-mono-jb uppercase">Completed</div>
                </div>
                <div className="bg-mc-bg border border-mc-border rounded p-2 text-center">
                  <div className={cn(
                    "text-lg font-mono-jb font-medium",
                    (metrics?.successRate ?? 0) >= 80 ? "text-mc-accent-green" :
                    (metrics?.successRate ?? 0) >= 50 ? "text-mc-accent-yellow" : "text-mc-accent-red"
                  )}>
                    {metrics?.successRate ?? liveAgent.tasksSuccessRate ?? 0}%
                  </div>
                  <div className="text-[9px] text-mc-muted font-mono-jb uppercase">Success</div>
                </div>
                <div className="bg-mc-bg border border-mc-border rounded p-2 text-center">
                  <div className="text-lg font-mono-jb font-medium text-mc-text">{formatDuration(metrics?.avgDurationMs ?? liveAgent.avgTaskDurationMs ?? 0)}</div>
                  <div className="text-[9px] text-mc-muted font-mono-jb uppercase">Avg Time</div>
                </div>
                <div className="bg-mc-bg border border-mc-border rounded p-2 text-center">
                  <div className="text-lg font-mono-jb font-medium text-mc-accent-yellow">{metrics?.activeTasks ?? 0}</div>
                  <div className="text-[9px] text-mc-muted font-mono-jb uppercase">Active</div>
                </div>
              </div>

              {/* Tags */}
              {liveAgent.tags && liveAgent.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {liveAgent.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 bg-mc-bg-tertiary rounded text-mc-text-secondary font-mono-jb">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Soul preview */}
              {liveAgent.soul && (
                <div className="bg-mc-bg border border-mc-border rounded overflow-hidden">
                  <div className="px-3 py-1.5 bg-[#1a1a1a] text-[10px] text-[#888] font-mono-jb uppercase tracking-wider">Soul</div>
                  <div className="p-3 text-sm text-mc-text prose-warm max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {liveAgent.soul.length > 300 ? liveAgent.soul.slice(0, 300) + "..." : liveAgent.soul}
                  </div>
                </div>
              )}

              {/* Session Console (mini) */}
              {liveAgent.sessionKey ? (
                <div className="bg-mc-bg border border-mc-border rounded overflow-hidden">
                  <div className="px-3 py-1.5 bg-[#1a1a1a] flex items-center justify-between">
                    <span className="text-[10px] text-[#888] font-mono-jb uppercase tracking-wider">Session</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-[#666] font-mono-jb truncate max-w-[200px]">{liveAgent.sessionKey}</span>
                      <button onClick={fetchHistory} disabled={loadingMessages} className="p-1 hover:bg-white/10 rounded">
                        <RefreshCw className={cn("w-3 h-3 text-[#888]", loadingMessages && "animate-spin")} />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto p-2 space-y-1.5">
                    {loadingMessages && messages.length === 0 ? (
                      <div className="text-[10px] text-mc-muted text-center py-4 font-mono-jb">Loading...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-[10px] text-mc-muted text-center py-4 font-mono-jb">No messages</div>
                    ) : (
                      messages
                        .filter((m) => m.role === "user" || m.role === "assistant")
                        .slice(-5)
                        .map((msg, i) => (
                          <div
                            key={`${msg.role}-${msg.timestamp ?? i}`}
                            className={cn(
                              "p-2 rounded text-xs",
                              msg.role === "user" ? "bg-mc-accent/10 ml-6" : "bg-mc-bg-tertiary mr-6"
                            )}
                          >
                            <div className="text-[9px] text-mc-muted font-mono-jb uppercase mb-0.5">
                              {msg.role === "user" ? "You" : liveAgent.name}
                            </div>
                            <div className="text-mc-text whitespace-pre-wrap">
                              {typeof msg.content === "string" && msg.content.length > 200
                                ? msg.content.slice(0, 200) + "..."
                                : msg.content}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="p-2 border-t border-mc-border flex gap-1.5">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Send a message..."
                      className="flex-1 bg-mc-bg-tertiary border border-mc-border rounded px-2 py-1 text-xs text-mc-text focus:outline-none focus:border-mc-accent"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="px-2 py-1 bg-mc-accent text-white rounded hover:bg-mc-accent-hover disabled:opacity-50 text-xs"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-mc-bg border border-mc-border rounded p-4 text-center">
                  <div className="text-sm text-mc-text-secondary mb-1">No OpenClaw session linked</div>
                  <div className="text-[10px] text-mc-muted font-mono-jb">Link a session to send messages and view history</div>
                </div>
              )}

              {/* Recent Activity */}
              {activity && activity.length > 0 && (
                <div className="bg-mc-bg border border-mc-border rounded overflow-hidden">
                  <div className="px-3 py-1.5 bg-[#1a1a1a] text-[10px] text-[#888] font-mono-jb uppercase tracking-wider">Recent Activity</div>
                  <div className="divide-y divide-mc-border max-h-36 overflow-y-auto">
                    {activity.slice(0, 8).map((evt) => (
                      <div key={evt._id} className="px-3 py-1.5 flex items-start gap-2">
                        <span className="w-4 text-center text-xs mt-0.5">{eventIcons[evt.type] || "•"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-mc-text truncate">{evt.message}</div>
                          <div className="text-[9px] text-mc-muted font-mono-jb">{formatTime(evt.timestamp)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════ SKILLS ════════ */}
          {tab === "skills" && (
            <div className="p-4 space-y-4">
              {liveAgent.skills && liveAgent.skills.length > 0 && !addingSkills && (
                <>
                  {(["technical", "creative", "analytical", "communication"] as const).map((cat) => {
                    const catSkills = liveAgent.skills!.filter((s) => s.category === cat);
                    if (catSkills.length === 0) return null;
                    return (
                      <div key={cat}>
                        <div className={cn("text-[10px] uppercase tracking-wider font-mono-jb mb-2", categoryColors[cat])}>
                          {cat}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {catSkills.map((skill) => (
                            <div key={skill.name} className="bg-mc-bg border border-mc-border rounded p-2 flex items-center justify-between">
                              <span className="text-sm text-mc-text">{skill.name}</span>
                              <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-mono-jb", levelColors[skill.level])}>
                                {levelLabels[skill.level]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Tool Permissions */}
                  {liveAgent.toolGroups && liveAgent.toolGroups.length > 0 && (
                    <div>
                      <div className="text-[10px] text-mc-text-secondary uppercase tracking-wider font-mono-jb mb-2 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Tool Permissions
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {liveAgent.toolGroups.map((tg) => {
                          const info = TOOL_GROUPS.find((g) => g.id === tg);
                          return (
                            <span key={tg} className="text-[10px] px-2 py-1 bg-mc-accent-green/10 text-mc-accent-green border border-mc-accent-green/20 rounded font-mono-jb">
                              {info?.label ?? tg}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => { setPendingSkills(liveAgent.skills ?? []); setAddingSkills(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-mc-accent border border-mc-accent/30 rounded hover:bg-mc-accent/10 transition-colors font-mono-jb uppercase tracking-wider"
                  >
                    <Plus className="w-3 h-3" />
                    Edit Skills
                  </button>
                </>
              )}

              {(!liveAgent.skills || liveAgent.skills.length === 0) && !addingSkills && (
                <div className="text-center py-8">
                  <div className="text-sm text-mc-text-secondary mb-2">No skills configured</div>
                  <button
                    onClick={() => { setPendingSkills([]); setAddingSkills(true); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-mc-accent border border-mc-accent/30 rounded hover:bg-mc-accent/10 transition-colors font-mono-jb uppercase tracking-wider"
                  >
                    <Plus className="w-3 h-3" />
                    Add Skills
                  </button>
                </div>
              )}

              {/* Inline Skill Picker */}
              {addingSkills && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-mc-text-secondary uppercase tracking-wider font-mono-jb">
                      Select Skills <span className="text-mc-muted">({pendingSkills.length} selected)</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAddingSkills(false)}
                        className="text-[10px] text-mc-text-secondary font-mono-jb hover:underline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSkills}
                        disabled={savingSkills}
                        className="text-[10px] text-mc-accent font-mono-jb hover:underline flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        {savingSkills ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                  {(["technical", "creative", "analytical", "communication"] as const).map((cat) => (
                    <div key={cat}>
                      <div className={cn("text-[10px] uppercase tracking-wider font-mono-jb mb-1", categoryColors[cat])}>{cat}</div>
                      <div className="flex flex-wrap gap-1">
                        {SKILL_CATALOG.filter((s) => s.category === cat).map((skill) => {
                          const selected = pendingSkills.some((s) => s.name === skill.name);
                          return (
                            <button
                              key={skill.name}
                              onClick={() => togglePendingSkill(skill.name, skill.category)}
                              className={cn(
                                "text-[10px] px-2 py-1 rounded font-mono-jb transition-colors",
                                selected
                                  ? "bg-mc-accent/15 text-mc-accent border border-mc-accent/30"
                                  : "bg-mc-bg-tertiary text-mc-text-secondary hover:text-mc-text"
                              )}
                            >
                              {skill.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════════ ACTIVITY ════════ */}
          {tab === "activity" && (
            <div className="p-4 space-y-4">
              {/* Task History */}
              <div>
                <div className="text-[10px] text-mc-text-secondary uppercase tracking-wider font-mono-jb mb-2">Task History</div>
                {taskHistory && taskHistory.length > 0 ? (
                  <div className="space-y-1.5">
                    {taskHistory.map((task) => (
                      <div key={task._id} className="bg-mc-bg border border-mc-border rounded p-2 flex items-center gap-3">
                        <span className={cn(
                          "w-5 h-5 rounded flex items-center justify-center flex-shrink-0",
                          task.status === "completed" ? "bg-mc-accent-green/15" :
                          task.status === "failed" ? "bg-mc-accent-red/15" :
                          task.status === "running" ? "bg-mc-accent-yellow/15" : "bg-mc-bg-tertiary"
                        )}>
                          {task.status === "completed" ? <CheckCircle2 className="w-3 h-3 text-mc-accent-green" /> :
                           task.status === "failed" ? <XCircle className="w-3 h-3 text-mc-accent-red" /> :
                           task.status === "running" ? <Zap className="w-3 h-3 text-mc-accent-yellow" /> :
                           <Clock className="w-3 h-3 text-mc-muted" />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-mc-text truncate">{task.title}</div>
                          <div className="text-[10px] text-mc-muted font-mono-jb">
                            {task.startedAt && task.completedAt
                              ? formatDuration(task.completedAt - task.startedAt)
                              : task.status}
                            {" · "}
                            {formatTime(task.createdAt)}
                          </div>
                        </div>
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded font-mono-jb font-semibold uppercase",
                          task.status === "completed" ? "text-mc-accent-green" :
                          task.status === "failed" ? "text-mc-accent-red" :
                          task.status === "running" ? "text-mc-accent-yellow" : "text-mc-muted"
                        )}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-[10px] text-mc-muted font-mono-jb">No task history</div>
                )}
              </div>

              {/* Event Timeline (exclude task events already shown above) */}
              <div>
                <div className="text-[10px] text-mc-text-secondary uppercase tracking-wider font-mono-jb mb-2">Events</div>
                {activity && activity.filter((evt) => !evt.type.startsWith("task_")).length > 0 ? (
                  <div className="space-y-0.5 max-h-64 overflow-y-auto">
                    {activity.filter((evt) => !evt.type.startsWith("task_")).map((evt) => (
                      <div key={evt._id} className="flex items-start gap-2 py-1">
                        <span className="w-4 text-center text-xs mt-0.5 flex-shrink-0">
                          {eventIcons[evt.type] || "•"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-mc-text">{evt.message}</div>
                          <div className="text-[9px] text-mc-muted font-mono-jb">{formatTime(evt.timestamp)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-[10px] text-mc-muted font-mono-jb">No events</div>
                )}
              </div>
            </div>
          )}

          {/* ════════ CONFIG ════════ */}
          {tab === "config" && (
            <div className="p-4 space-y-4">
              {/* Soul Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] text-mc-text-secondary uppercase tracking-wider font-mono-jb">Soul (Personality & Instructions)</div>
                  {!editingSoul ? (
                    <button
                      onClick={() => { setSoulDraft(liveAgent.soul || ""); setEditingSoul(true); }}
                      className="text-[10px] text-mc-accent font-mono-jb hover:underline"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingSoul(false)}
                        className="text-[10px] text-mc-text-secondary font-mono-jb hover:underline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSoul}
                        disabled={savingSoul}
                        className="text-[10px] text-mc-accent font-mono-jb hover:underline flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        {savingSoul ? "Saving..." : "Save"}
                      </button>
                    </div>
                  )}
                </div>
                {editingSoul ? (
                  <textarea
                    value={soulDraft}
                    onChange={(e) => setSoulDraft(e.target.value)}
                    rows={10}
                    className="w-full bg-mc-bg border border-mc-border rounded p-3 text-sm text-mc-text focus:outline-none focus:border-mc-accent resize-none font-mono-jb"
                    placeholder="# Agent Name&#10;&#10;Describe personality, expertise, communication style..."
                  />
                ) : (
                  <div className="bg-mc-bg border border-mc-border rounded p-3 text-sm text-mc-text whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {liveAgent.soul || <span className="text-mc-muted italic">No soul configured</span>}
                  </div>
                )}
              </div>

              {/* Model & Runtime Config */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] text-mc-text-secondary uppercase tracking-wider font-mono-jb">Model & Runtime</div>
                  {!editingConfig ? (
                    <button
                      onClick={() => {
                        setConfigThinking(liveAgent.thinkingLevel ?? "none");
                        setConfigToolGroups(liveAgent.toolGroups ?? []);
                        setConfigModelFallback(liveAgent.modelFallback ?? "");
                        setEditingConfig(true);
                      }}
                      className="text-[10px] text-mc-accent font-mono-jb hover:underline"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingConfig(false)}
                        className="text-[10px] text-mc-text-secondary font-mono-jb hover:underline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveConfig}
                        disabled={savingConfig}
                        className="text-[10px] text-mc-accent font-mono-jb hover:underline flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        {savingConfig ? "Saving..." : "Save"}
                      </button>
                    </div>
                  )}
                </div>
                <div className="bg-mc-bg border border-mc-border rounded p-3 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-mc-text-secondary">Primary Model</span>
                    <span className="text-mc-text font-mono-jb text-xs">{getModelIcon(liveAgent.model)} {getModelLabel(liveAgent.model)}</span>
                  </div>

                  {editingConfig ? (
                    <>
                      {/* Fallback Model */}
                      <div>
                        <div className="text-[10px] text-mc-muted font-mono-jb mb-1">Fallback Model</div>
                        <select
                          value={configModelFallback}
                          onChange={(e) => setConfigModelFallback(e.target.value)}
                          className="w-full bg-mc-bg-tertiary border border-mc-border rounded px-2 py-1 text-xs text-mc-text focus:outline-none focus:border-mc-accent"
                        >
                          <option value="">None</option>
                          {MODEL_OPTIONS.map((m) => (
                            <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Thinking Level */}
                      <div>
                        <div className="text-[10px] text-mc-muted font-mono-jb mb-1">Thinking Level</div>
                        <div className="flex gap-1">
                          {THINKING_LEVELS.map((t) => (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => setConfigThinking(t.value)}
                              className={cn(
                                "px-2.5 py-1 text-[10px] rounded font-mono-jb transition-colors",
                                configThinking === t.value
                                  ? "bg-mc-accent/15 text-mc-accent border border-mc-accent/30"
                                  : "bg-mc-bg-tertiary text-mc-text-secondary hover:text-mc-text"
                              )}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tool Groups */}
                      <div>
                        <div className="text-[10px] text-mc-muted font-mono-jb mb-1 flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Tool Permissions
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {TOOL_GROUPS.map((tg) => (
                            <button
                              key={tg.id}
                              type="button"
                              onClick={() => toggleConfigToolGroup(tg.id)}
                              className={cn(
                                "flex items-center gap-2 px-2 py-1 rounded text-left transition-colors",
                                configToolGroups.includes(tg.id)
                                  ? "bg-mc-accent-green/10 border border-mc-accent-green/30"
                                  : "bg-mc-bg-tertiary border border-transparent"
                              )}
                            >
                              <span className={cn(
                                "w-3 h-3 rounded-sm border flex items-center justify-center text-[8px]",
                                configToolGroups.includes(tg.id) ? "bg-mc-accent-green border-mc-accent-green text-white" : "border-mc-border"
                              )}>
                                {configToolGroups.includes(tg.id) && "✓"}
                              </span>
                              <span className="text-[10px] text-mc-text font-mono-jb">{tg.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-mc-text-secondary">Fallback</span>
                        <span className="text-mc-text font-mono-jb text-xs">{liveAgent.modelFallback ? getModelLabel(liveAgent.modelFallback) : <span className="text-mc-muted">None</span>}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-mc-text-secondary">Thinking Level</span>
                        <span className="text-mc-text font-mono-jb text-xs capitalize">{liveAgent.thinkingLevel || "none"}</span>
                      </div>
                      {liveAgent.toolGroups && liveAgent.toolGroups.length > 0 && (
                        <div>
                          <div className="text-[10px] text-mc-muted font-mono-jb mb-1 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Tool Permissions
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {liveAgent.toolGroups.map((tg) => {
                              const info = TOOL_GROUPS.find((g) => g.id === tg);
                              return (
                                <span key={tg} className="text-[10px] px-1.5 py-0.5 bg-mc-accent-green/10 text-mc-accent-green border border-mc-accent-green/20 rounded font-mono-jb">
                                  {info?.label ?? tg}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* OpenClaw Info */}
              <div>
                <div className="text-[10px] text-mc-text-secondary uppercase tracking-wider font-mono-jb mb-2">OpenClaw Integration</div>
                <div className="bg-mc-bg border border-mc-border rounded p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-mc-text-secondary">Agent ID</span>
                    <span className="text-mc-text font-mono-jb text-xs">{liveAgent.openclawId || <span className="text-mc-muted">Not linked</span>}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-mc-text-secondary">Session</span>
                    <span className="text-mc-text font-mono-jb text-xs truncate max-w-[200px]">{liveAgent.sessionKey || <span className="text-mc-muted">No session</span>}</span>
                  </div>
                  {liveAgent.channel && (
                    <div className="flex justify-between text-sm">
                      <span className="text-mc-text-secondary">Channel</span>
                      <span className="text-mc-text font-mono-jb text-xs">{liveAgent.channel}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-mc-border">
                <div className="text-[10px] text-mc-accent-red uppercase tracking-wider font-mono-jb mb-2">Danger Zone</div>
                <button
                  onClick={handleDelete}
                  onBlur={() => setConfirmDelete(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-mc-accent-red border border-mc-accent-red/30 rounded hover:bg-mc-accent-red/10 transition-colors font-mono-jb"
                >
                  <Trash2 className="w-3 h-3" />
                  {confirmDelete ? "Click again to confirm" : "Delete Agent"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
