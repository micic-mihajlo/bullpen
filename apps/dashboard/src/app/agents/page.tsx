"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import { useStableData } from "@/lib/hooks";
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
  Activity,
  Zap,
  Sparkles,
  Shield,
  BarChart3,
  X,
  ChevronRight,
  Target,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

type Skill = {
  name: string;
  category: string;
  level: "learning" | "proficient" | "expert";
};

type Agent = {
  _id: Id<"agents">;
  name: string;
  avatar?: string;
  status: string;
  role?: string;
  soul?: string;
  model?: string;
  modelFallback?: string;
  thinkingLevel?: string;
  skills?: Skill[];
  tags?: string[];
  toolGroups?: string[];
  sessionKey?: string;
  lastSeen: number;
  currentTaskId?: Id<"tasks">;
  tasksCompleted?: number;
  tasksSuccessRate?: number;
  avgTaskDurationMs?: number;
  openclawId?: string;
};

type FilterTab = "all" | "online" | "offline";

// ─── Constants ───────────────────────────────────────────────

const MODEL_OPTIONS = [
  { value: "cerebras/zai-glm-4.7", label: "Cerebras", icon: "⚡" },
  { value: "anthropic/claude-opus-4-5", label: "Opus", icon: "🧠" },
  { value: "anthropic/claude-sonnet-4-20250514", label: "Sonnet", icon: "💎" },
  { value: "openai/gpt-5.2-mini", label: "GPT-5.2 Mini", icon: "🟢" },
];

const THINKING_LEVELS = [
  { value: "none", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

const SKILL_CATALOG: { name: string; category: string }[] = [
  // Technical
  { name: "coding", category: "technical" },
  { name: "debugging", category: "technical" },
  { name: "architecture", category: "technical" },
  { name: "devops", category: "technical" },
  { name: "database", category: "technical" },
  { name: "api-design", category: "technical" },
  // Creative
  { name: "copywriting", category: "creative" },
  { name: "editing", category: "creative" },
  { name: "ui-design", category: "creative" },
  { name: "branding", category: "creative" },
  { name: "storytelling", category: "creative" },
  // Analytical
  { name: "research", category: "analytical" },
  { name: "data-analysis", category: "analytical" },
  { name: "market-analysis", category: "analytical" },
  { name: "reporting", category: "analytical" },
  { name: "strategy", category: "analytical" },
  // Communication
  { name: "seo", category: "communication" },
  { name: "social-media", category: "communication" },
  { name: "email-marketing", category: "communication" },
  { name: "documentation", category: "communication" },
  { name: "presentations", category: "communication" },
];

const TOOL_GROUPS = [
  { id: "fs", label: "File System", desc: "Read, write, edit files" },
  { id: "runtime", label: "Runtime", desc: "Execute code, run commands" },
  { id: "sessions", label: "Sessions", desc: "Manage chat sessions" },
  { id: "memory", label: "Memory", desc: "Search agent memory" },
  { id: "ui", label: "Browser/UI", desc: "Web browsing, canvas" },
  { id: "automation", label: "Automation", desc: "Cron, webhooks" },
];

// ─── Agent Templates ─────────────────────────────────────────

type AgentTemplate = {
  name: string;
  icon: string;
  role: string;
  skills: Skill[];
  tags: string[];
  defaultModel: string;
  thinkingLevel: "none" | "low" | "medium" | "high";
  toolGroups: string[];
  soulTemplate: string;
};

const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    name: "Researcher",
    icon: "🔬",
    role: "Researcher",
    skills: [
      { name: "research", category: "analytical", level: "expert" },
      { name: "data-analysis", category: "analytical", level: "proficient" },
      { name: "reporting", category: "analytical", level: "proficient" },
      { name: "copywriting", category: "creative", level: "proficient" },
    ],
    tags: ["research", "analysis", "reports"],
    defaultModel: "anthropic/claude-opus-4-5",
    thinkingLevel: "high",
    toolGroups: ["fs", "memory", "sessions"],
    soulTemplate: `# Researcher Agent

You are a meticulous research specialist. Your job is to produce comprehensive, well-sourced research reports.

## Style
- Thorough and methodical
- Always cite sources and evidence
- Present findings in clear, structured formats
- Flag confidence levels for claims

## Expertise
- Market research & competitive analysis
- Literature review & synthesis
- Data interpretation & visualization
- Report writing & executive summaries`,
  },
  {
    name: "Developer",
    icon: "💻",
    role: "Developer",
    skills: [
      { name: "coding", category: "technical", level: "expert" },
      { name: "debugging", category: "technical", level: "expert" },
      { name: "architecture", category: "technical", level: "proficient" },
      { name: "documentation", category: "communication", level: "proficient" },
    ],
    tags: ["code", "frontend", "backend", "fullstack"],
    defaultModel: "anthropic/claude-sonnet-4-20250514",
    thinkingLevel: "medium",
    toolGroups: ["fs", "runtime", "memory", "sessions"],
    soulTemplate: `# Developer Agent

You are a skilled software engineer who writes clean, maintainable code.

## Style
- Pragmatic and efficient
- Write self-documenting code
- Test-driven when possible
- Security-conscious

## Expertise
- Full-stack web development (React, Next.js, Node)
- API design & database modeling
- Code review & refactoring
- DevOps & deployment`,
  },
  {
    name: "Writer",
    icon: "✍️",
    role: "Content Writer",
    skills: [
      { name: "copywriting", category: "creative", level: "expert" },
      { name: "editing", category: "creative", level: "expert" },
      { name: "seo", category: "communication", level: "proficient" },
      { name: "storytelling", category: "creative", level: "proficient" },
    ],
    tags: ["content", "copy", "blog", "marketing"],
    defaultModel: "anthropic/claude-sonnet-4-20250514",
    thinkingLevel: "low",
    toolGroups: ["fs", "memory"],
    soulTemplate: `# Content Writer Agent

You are a versatile content creator who crafts compelling narratives.

## Style
- Clear, engaging prose
- Adapt tone to audience and brand
- SEO-aware without keyword stuffing
- Strong hooks and calls-to-action

## Expertise
- Blog posts & articles
- Marketing copy & landing pages
- Email campaigns
- Social media content`,
  },
  {
    name: "Designer",
    icon: "🎨",
    role: "Designer",
    skills: [
      { name: "ui-design", category: "creative", level: "expert" },
      { name: "branding", category: "creative", level: "proficient" },
      { name: "research", category: "analytical", level: "learning" },
      { name: "presentations", category: "communication", level: "proficient" },
    ],
    tags: ["design", "ui", "ux", "visual"],
    defaultModel: "anthropic/claude-sonnet-4-20250514",
    thinkingLevel: "medium",
    toolGroups: ["fs", "ui", "memory"],
    soulTemplate: `# Designer Agent

You are a design-focused agent with strong visual thinking.

## Style
- User-centric and accessible
- Clean, modern aesthetics
- Data-informed design decisions
- Systematic thinking (design systems)

## Expertise
- UI/UX design & prototyping
- Design systems & component libraries
- Visual identity & branding
- User research & usability`,
  },
  {
    name: "Strategist",
    icon: "🎯",
    role: "Strategist",
    skills: [
      { name: "strategy", category: "analytical", level: "expert" },
      { name: "market-analysis", category: "analytical", level: "expert" },
      { name: "research", category: "analytical", level: "proficient" },
      { name: "presentations", category: "communication", level: "proficient" },
    ],
    tags: ["strategy", "planning", "growth", "market"],
    defaultModel: "anthropic/claude-opus-4-5",
    thinkingLevel: "high",
    toolGroups: ["fs", "memory", "sessions"],
    soulTemplate: `# Strategist Agent

You are a strategic thinker who connects insights to action.

## Style
- Big-picture thinking with tactical detail
- Framework-driven analysis
- Clear recommendations with rationale
- Risk-aware planning

## Expertise
- Go-to-market strategy
- Competitive positioning
- Growth planning & metrics
- Stakeholder presentations`,
  },
  {
    name: "Analyst",
    icon: "📊",
    role: "Data Analyst",
    skills: [
      { name: "data-analysis", category: "analytical", level: "expert" },
      { name: "reporting", category: "analytical", level: "expert" },
      { name: "research", category: "analytical", level: "proficient" },
      { name: "coding", category: "technical", level: "learning" },
    ],
    tags: ["data", "analytics", "metrics", "reporting"],
    defaultModel: "cerebras/zai-glm-4.7",
    thinkingLevel: "medium",
    toolGroups: ["fs", "runtime", "memory"],
    soulTemplate: `# Data Analyst Agent

You are a data-driven analyst who turns numbers into insights.

## Style
- Precise and quantitative
- Visual data presentation
- Statistical rigor
- Actionable recommendations

## Expertise
- Data processing & cleaning
- Statistical analysis
- Dashboard creation & reporting
- Trend identification & forecasting`,
  },
];

// ─── Helpers ─────────────────────────────────────────────────

function getModelLabel(model?: string) {
  if (!model) return "Default model";
  const opt = MODEL_OPTIONS.find((m) => m.value === model);
  return opt?.label ?? model.split("/")[1] ?? model;
}

function getModelIcon(model?: string) {
  if (!model) return null;
  const opt = MODEL_OPTIONS.find((m) => m.value === model);
  return opt?.icon ?? null;
}

const levelColors = {
  learning: "bg-mc-accent-cyan/15 text-mc-accent-cyan",
  proficient: "bg-mc-accent-green/15 text-mc-accent-green",
  expert: "bg-mc-accent/15 text-mc-accent",
};

function getRole(agent: Agent) {
  if (agent.role) return agent.role;
  return agent.soul?.match(/Role:\s*(.+)/)?.[1] ?? null;
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(0)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(0)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

// ─── Component ───────────────────────────────────────────────

export default function AgentsPage() {
  const agents = useStableData(useQuery(api.agents.list));
  const tasks = useStableData(useQuery(api.tasks.list));
  const createAgent = useMutation(api.agents.create);
  const { addToast } = useToast();

  const [filter, setFilter] = useState<FilterTab>("all");
  const [skillFilter, setSkillFilter] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<"templates" | "custom">("templates");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Custom creation state
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newAvatar, setNewAvatar] = useState("🤖");
  const [newModel, setNewModel] = useState("cerebras/zai-glm-4.7");
  const [newThinking, setNewThinking] = useState<"none" | "low" | "medium" | "high">("medium");
  const [newSkills, setNewSkills] = useState<Skill[]>([]);
  const [newTags, setNewTags] = useState("");
  const [newSoul, setNewSoul] = useState("");
  const [newToolGroups, setNewToolGroups] = useState<string[]>(["fs", "memory"]);
  const [isCreating, setIsCreating] = useState(false);

  const openCreate = useCallback(() => {
    setCreateMode("templates");
    setShowCreate(true);
  }, []);
  useRegisterShortcut("newAgent", openCreate);

  // Filters
  const filtered = agents?.filter((a) => {
    if (filter === "online" && a.status !== "online" && a.status !== "busy") return false;
    if (filter === "offline" && a.status !== "offline") return false;
    if (skillFilter) {
      const skills = (a as Agent).skills;
      if (!skills?.some((s) => s.name === skillFilter)) return false;
    }
    return true;
  });

  // Stats
  const online = agents?.filter((a) => a.status === "online" || a.status === "busy").length ?? 0;
  const busy = agents?.filter((a) => a.status === "busy").length ?? 0;
  const totalSkills = new Set(agents?.flatMap((a) => (a as Agent).skills?.map((s) => s.name) ?? [])).size;

  const getAgentTask = (agentId: Id<"agents">) =>
    tasks?.find((t) => t.assignedAgentId === agentId && (t.status === "running" || t.status === "assigned"));

  // Template creation
  const handleCreateFromTemplate = async (template: AgentTemplate) => {
    setIsCreating(true);
    try {
      await createAgent({
        name: template.name,
        avatar: template.icon,
        role: template.role,
        soul: template.soulTemplate,
        model: template.defaultModel,
        thinkingLevel: template.thinkingLevel,
        skills: template.skills,
        tags: template.tags,
        toolGroups: template.toolGroups,
      });
      addToast(`Agent "${template.name}" created`, "success");
      setShowCreate(false);
    } catch {
      addToast("Failed to create agent", "error");
    } finally {
      setIsCreating(false);
    }
  };

  // Custom creation
  const handleCustomCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      await createAgent({
        name: newName.trim(),
        avatar: newAvatar,
        role: newRole || undefined,
        soul: newSoul || undefined,
        model: newModel,
        thinkingLevel: newThinking,
        skills: newSkills.length > 0 ? newSkills : undefined,
        tags: newTags ? newTags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
        toolGroups: newToolGroups.length > 0 ? newToolGroups : undefined,
      });
      addToast(`Agent "${newName.trim()}" created`, "success");
      resetCustomForm();
      setShowCreate(false);
    } catch {
      addToast("Failed to create agent", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const resetCustomForm = () => {
    setNewName("");
    setNewRole("");
    setNewAvatar("🤖");
    setNewModel("cerebras/zai-glm-4.7");
    setNewThinking("medium");
    setNewSkills([]);
    setNewTags("");
    setNewSoul("");
    setNewToolGroups(["fs", "memory"]);
  };

  const toggleSkill = (name: string, category: string) => {
    setNewSkills((prev) => {
      const exists = prev.find((s) => s.name === name);
      if (exists) return prev.filter((s) => s.name !== name);
      return [...prev, { name, category, level: "proficient" as const }];
    });
  };

  const toggleToolGroup = (id: string) => {
    setNewToolGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  // Unique skill names across all agents for filter
  const allSkillNames = [...new Set(agents?.flatMap((a) => (a as Agent).skills?.map((s) => s.name) ?? []) ?? [])];

  const AVATARS = ["🤖", "🦾", "🧠", "👾", "🎯", "⚡", "🔮", "🦊", "🐙", "🌟", "🔬", "💻", "✍️", "🎨", "📊"];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-mc-border bg-mc-bg-secondary/80 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl tracking-wider text-mc-text uppercase">Agents</h1>
            <p className="text-[10px] text-mc-muted font-mono-jb uppercase tracking-widest">/// {agents?.length ?? 0} registered · {online} online · {totalSkills} skills</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-xs bg-mc-accent text-white uppercase tracking-wider hover:bg-mc-accent-hover transition-colors font-mono-jb"
          >
            <Plus className="w-3.5 h-3.5" />
            New Agent
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Agents" value={agents?.length ?? 0} icon={<Bot className="w-4 h-4" />} accent="blue" />
          <StatCard label="Online" value={online} icon={<Wifi className="w-4 h-4" />} accent="green" />
          <StatCard label="Working" value={busy} icon={<Activity className="w-4 h-4" />} accent="yellow" />
          <StatCard
            label="Avg Success Rate"
            value={
              agents && agents.length > 0
                ? `${Math.round(agents.reduce((acc, a) => acc + ((a as Agent).tasksSuccessRate ?? 0), 0) / Math.max(agents.filter((a) => (a as Agent).tasksCompleted && (a as Agent).tasksCompleted! > 0).length, 1))}%`
                : "—"
            }
            icon={<BarChart3 className="w-4 h-4" />}
            accent="purple"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {(["all", "online", "offline"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "px-2.5 py-1 text-xs rounded transition-colors capitalize font-mono-jb",
                  filter === tab
                    ? "bg-mc-accent/10 text-mc-accent border border-mc-accent/30 font-medium"
                    : "text-mc-text-secondary hover:text-mc-text hover:bg-mc-bg-tertiary"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {allSkillNames.length > 0 && (
            <>
              <div className="w-px h-4 bg-mc-border" />
              <div className="flex gap-1 flex-wrap">
                {skillFilter && (
                  <button
                    onClick={() => setSkillFilter(null)}
                    className="px-2 py-1 text-[10px] rounded bg-mc-accent/10 text-mc-accent border border-mc-accent/30 font-mono-jb flex items-center gap-1"
                  >
                    {skillFilter} <X className="w-2.5 h-2.5" />
                  </button>
                )}
                {!skillFilter && allSkillNames.slice(0, 6).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => setSkillFilter(skill)}
                    className="px-2 py-1 text-[10px] rounded text-mc-text-secondary hover:text-mc-text hover:bg-mc-bg-tertiary font-mono-jb transition-colors"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Agent Grid */}
        {!agents ? (
          <SkeletonList count={6} />
        ) : filtered?.length === 0 ? (
          <EmptyState
            icon={<Bot className="w-10 h-10" />}
            title={filter === "all" && !skillFilter ? "No agents yet" : "No matching agents"}
            description="Create an agent to start orchestrating"
            action={{ label: "New Agent", onClick: openCreate }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered?.map((agent) => {
              const a = agent as Agent;
              const role = getRole(a);
              const currentTask = getAgentTask(a._id);
              const topSkills = a.skills?.slice(0, 2) ?? [];
              return (
                <div
                  key={a._id}
                  onClick={() => setSelectedAgent(a)}
                  className="bg-mc-bg-secondary border border-mc-border rounded hover:border-mc-accent/30 cursor-pointer transition-all group overflow-hidden"
                >
                  {/* Card header with status bar */}
                  <div className={cn(
                    "h-1",
                    a.status === "online" ? "bg-mc-accent-green" :
                    a.status === "busy" ? "bg-mc-accent-yellow" : "bg-mc-border"
                  )} />

                  <div className="p-3">
                    {/* Identity row */}
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-2xl">{a.avatar || "🤖"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate text-mc-text">{a.name}</span>
                          {a.sessionKey && <Link2 className="w-3 h-3 text-mc-accent flex-shrink-0" />}
                        </div>
                        <div className="text-xs text-mc-text-secondary">
                          {role || (a.soul ? a.soul.slice(0, 40).replace(/\n/g, " ") : "Configure this agent →")}
                        </div>
                      </div>
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-mono-jb font-semibold uppercase",
                        a.status === "online" ? "status-online" :
                        a.status === "busy" ? "status-busy" : "status-offline"
                      )}>
                        {a.status}
                      </span>
                    </div>

                    {/* Skills */}
                    {topSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {topSkills.map((s) => (
                          <span
                            key={s.name}
                            className={cn("text-[10px] px-1.5 py-0.5 rounded font-mono-jb", levelColors[s.level])}
                          >
                            {s.name}
                          </span>
                        ))}
                        {a.skills && a.skills.length > 2 && (
                          <span className="text-[10px] px-1.5 py-0.5 text-mc-muted font-mono-jb">
                            +{a.skills.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Model + Tags */}
                    <div className="flex items-center gap-2 text-[10px] text-mc-text-secondary mb-1.5 font-mono-jb">
                      {getModelIcon(a.model) && <span>{getModelIcon(a.model)}</span>}
                      <span>{getModelLabel(a.model)}</span>
                      {a.tags && a.tags.length > 0 && (
                        <>
                          <span className="text-mc-border">·</span>
                          <span className="truncate text-mc-muted">{a.tags.slice(0, 3).join(", ")}</span>
                        </>
                      )}
                    </div>

                    {/* Current task */}
                    {currentTask && (
                      <div className="text-[10px] bg-mc-accent-yellow/10 text-mc-accent-yellow px-2 py-1 rounded mb-1.5 truncate font-mono-jb font-semibold uppercase tracking-wide">
                        Working: {currentTask.title}
                      </div>
                    )}

                    {/* Bottom row: metrics + last seen */}
                    <div className="flex items-center justify-between text-[10px] text-mc-muted font-mono-jb">
                      <div className="flex items-center gap-2">
                        {a.tasksCompleted != null && a.tasksCompleted > 0 && (
                          <>
                            <span>{a.tasksCompleted} tasks</span>
                            {a.tasksSuccessRate != null && (
                              <span className={a.tasksSuccessRate >= 80 ? "text-mc-accent-green" : a.tasksSuccessRate >= 50 ? "text-mc-accent-yellow" : "text-mc-accent-red"}>
                                {a.tasksSuccessRate}%
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <span>
                        {a.status === "online" || a.status === "busy"
                          ? "Active now"
                          : `${formatTime(a.lastSeen)}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Agent Modal */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); resetCustomForm(); }}
        title={createMode === "templates" ? "New Agent" : "Custom Agent"}
        size="lg"
      >
        {createMode === "templates" ? (
          <div className="p-4 space-y-4">
            {/* Template Grid */}
            <div>
              <div className="text-[10px] text-mc-text-secondary uppercase tracking-wider font-mono-jb mb-2">Choose a Template</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AGENT_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => handleCreateFromTemplate(tpl)}
                    disabled={isCreating}
                    className="p-3 bg-mc-bg border border-mc-border rounded hover:border-mc-accent/40 transition-all text-left group/tpl disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">{tpl.icon}</span>
                      <span className="text-sm font-medium text-mc-text">{tpl.name}</span>
                    </div>
                    <div className="text-[10px] text-mc-text-secondary mb-2">{tpl.role}</div>
                    <div className="flex flex-wrap gap-1">
                      {tpl.skills.slice(0, 2).map((s) => (
                        <span key={s.name} className="text-[9px] px-1 py-0.5 bg-mc-bg-tertiary rounded text-mc-muted font-mono-jb">
                          {s.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-mc-muted font-mono-jb">
                      {getModelIcon(tpl.defaultModel)} {getModelLabel(tpl.defaultModel)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom option */}
            <div className="pt-2 border-t border-mc-border">
              <button
                onClick={() => setCreateMode("custom")}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-mc-text-secondary hover:text-mc-text hover:bg-mc-bg-tertiary rounded transition-colors font-mono-jb"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Build custom agent
                </span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomCreate} className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Back button */}
            <button
              type="button"
              onClick={() => setCreateMode("templates")}
              className="text-[10px] text-mc-accent font-mono-jb uppercase tracking-wider hover:underline"
            >
              ← Back to templates
            </button>

            {/* Identity */}
            <div>
              <div className="text-[10px] text-mc-text-secondary uppercase tracking-wider font-mono-jb mb-2">Identity</div>
              <div className="flex gap-1.5 flex-wrap mb-2">
                {AVATARS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setNewAvatar(e)}
                    className={cn(
                      "w-8 h-8 rounded text-base flex items-center justify-center transition-colors",
                      newAvatar === e ? "bg-mc-accent/20 ring-1 ring-mc-accent" : "bg-mc-bg-tertiary hover:bg-mc-bg-tertiary/80"
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Agent name"
                  className="bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
                  autoFocus
                />
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="Role (e.g. Researcher)"
                  className="bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <div className="text-[10px] text-mc-text-secondary uppercase tracking-wider font-mono-jb mb-2">
                Skills <span className="text-mc-muted">({newSkills.length} selected)</span>
              </div>
              {(["technical", "creative", "analytical", "communication"] as const).map((cat) => (
                <div key={cat} className="mb-2">
                  <div className="text-[10px] text-mc-muted font-mono-jb uppercase tracking-wider mb-1">{cat}</div>
                  <div className="flex flex-wrap gap-1">
                    {SKILL_CATALOG.filter((s) => s.category === cat).map((skill) => {
                      const selected = newSkills.some((s) => s.name === skill.name);
                      return (
                        <button
                          key={skill.name}
                          type="button"
                          onClick={() => toggleSkill(skill.name, skill.category)}
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

            {/* Model Config */}
            <div>
              <div className="text-[10px] text-mc-text-secondary uppercase tracking-wider font-mono-jb mb-2">Model</div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
                >
                  {MODEL_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
                  ))}
                </select>
                <select
                  value={newThinking}
                  onChange={(e) => setNewThinking(e.target.value as typeof newThinking)}
                  className="bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
                >
                  {THINKING_LEVELS.map((t) => (
                    <option key={t.value} value={t.value}>Thinking: {t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tool Permissions */}
            <div>
              <div className="text-[10px] text-mc-text-secondary uppercase tracking-wider font-mono-jb mb-2">
                <Shield className="w-3 h-3 inline mr-1" />Tool Permissions
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {TOOL_GROUPS.map((tg) => (
                  <button
                    key={tg.id}
                    type="button"
                    onClick={() => toggleToolGroup(tg.id)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors",
                      newToolGroups.includes(tg.id)
                        ? "bg-mc-accent-green/10 border border-mc-accent-green/30"
                        : "bg-mc-bg-tertiary border border-transparent"
                    )}
                  >
                    <span className={cn(
                      "w-3 h-3 rounded-sm border flex items-center justify-center text-[8px]",
                      newToolGroups.includes(tg.id) ? "bg-mc-accent-green border-mc-accent-green text-white" : "border-mc-border"
                    )}>
                      {newToolGroups.includes(tg.id) && "✓"}
                    </span>
                    <div>
                      <div className="text-[10px] text-mc-text font-mono-jb">{tg.label}</div>
                      <div className="text-[9px] text-mc-muted">{tg.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="text-[10px] text-mc-text-secondary uppercase tracking-wider font-mono-jb mb-2">Tags</div>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="comma-separated: frontend, react, ux"
                className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
              />
            </div>

            {/* Soul */}
            <div>
              <div className="text-[10px] text-mc-text-secondary uppercase tracking-wider font-mono-jb mb-2">Soul (personality & instructions)</div>
              <textarea
                value={newSoul}
                onChange={(e) => setNewSoul(e.target.value)}
                placeholder="# Agent Name&#10;&#10;Describe personality, expertise, communication style..."
                rows={5}
                className="w-full bg-mc-bg border border-mc-border rounded px-3 py-2 text-sm text-mc-text focus:outline-none focus:border-mc-accent resize-none font-mono-jb"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-1 sticky bottom-0 bg-mc-bg-secondary py-2">
              <button type="button" onClick={() => { setShowCreate(false); resetCustomForm(); }} className="px-3 py-1.5 text-xs text-mc-text-secondary hover:text-mc-text">
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newName.trim() || isCreating}
                className="px-4 py-1.5 text-xs bg-mc-accent text-white rounded hover:bg-mc-accent-hover disabled:opacity-50 font-mono-jb uppercase tracking-wider"
              >
                {isCreating ? "Creating..." : "Create Agent"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <AgentDetail agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
    </div>
  );
}
