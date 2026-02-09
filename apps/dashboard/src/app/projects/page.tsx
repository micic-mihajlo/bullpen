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
import { SkeletonCard } from "@/components/ui/skeleton";
import { useToast } from "@/components/toast";
import { useRegisterShortcut } from "@/components/shortcuts-provider";
import { TaskDetailPanel } from "@/components/task-detail-panel";
import {
  Plus,
  FolderKanban,
  Calendar,
  ArrowRight,
  X,
  ChevronDown,
  Code2,
  Cog,
  Search,
  Palette,
  FileCheck2,
  FileText,
  Bot,
} from "lucide-react";

const taskTypeIcons: Record<string, React.ReactNode> = {
  coding: <Code2 className="w-3 h-3" />,
  automation: <Cog className="w-3 h-3" />,
  research: <Search className="w-3 h-3" />,
  design: <Palette className="w-3 h-3" />,
  review: <FileCheck2 className="w-3 h-3" />,
  general: <FileText className="w-3 h-3" />,
};

type ProjectStatus = "intake" | "active" | "review" | "delivered" | "archived";

const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  intake: { label: "Intake", color: "text-mc-text-secondary", bg: "bg-mc-bg-tertiary" },
  active: { label: "Active", color: "text-mc-accent-green", bg: "bg-mc-accent-green/12" },
  review: { label: "Review", color: "text-mc-accent-yellow", bg: "bg-mc-accent-yellow/12" },
  delivered: { label: "Delivered", color: "text-mc-accent", bg: "bg-mc-accent/12" },
  archived: { label: "Archived", color: "text-mc-text-secondary", bg: "bg-mc-bg-tertiary" },
};

const typeEmoji: Record<string, string> = {
  research: "🔍",
  code: "💻",
  content: "📝",
  design: "🎨",
};

export default function ProjectsPage() {
  const projects = useStableData(useQuery(api.projects.list));
  const clients = useStableData(useQuery(api.clients.list));
  const createProject = useMutation(api.projects.create);
  const updateStatus = useMutation(api.projects.updateStatus);
  const { addToast } = useToast();

  const [filter, setFilter] = useState<ProjectStatus | "all">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<Id<"projects"> | null>(null);

  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("research");
  const [formBrief, setFormBrief] = useState("");
  const [formClientId, setFormClientId] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [creating, setCreating] = useState(false);

  const openCreate = useCallback(() => setShowCreate(true), []);
  useRegisterShortcut("newProject", openCreate);

  const filtered = projects?.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formClientId) return;
    setCreating(true);
    try {
      await createProject({
        clientId: formClientId as Id<"clients">,
        name: formName.trim(),
        type: formType,
        brief: formBrief.trim() || undefined,
        deadline: formDeadline ? new Date(formDeadline).getTime() : undefined,
      });
      addToast(`Project "${formName.trim()}" created`, "success");
      resetForm();
      setShowCreate(false);
    } catch {
      addToast("Failed to create project", "error");
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setFormName("");
    setFormType("research");
    setFormBrief("");
    setFormClientId("");
    setFormDeadline("");
  };

  const handleStatusChange = async (projectId: Id<"projects">, newStatus: ProjectStatus) => {
    try {
      await updateStatus({ id: projectId, status: newStatus });
      addToast(`Status updated to ${newStatus}`, "success");
    } catch {
      addToast("Failed to update status", "error");
    }
  };

  const statusTabs: (ProjectStatus | "all")[] = ["all", "intake", "active", "review", "delivered", "archived"];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[#e8e5de] bg-white/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a1a1a]" style={{ fontFamily: 'Inter, sans-serif' }}>Projects</h1>
            <p className="text-[12px] text-[#9c9590] mt-0.5">{projects?.length ?? 0} total</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs bg-[#c2410c] text-white rounded-lg hover:bg-[#9a3412] transition-colors font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-mc-border">
        <div className="flex gap-1">
          {statusTabs.map((tab) => (
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
              {tab !== "all" && projects && (
                <span className="ml-1 text-mc-muted">
                  {projects.filter((p) => p.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedId ? (
          <ProjectDetail
            projectId={selectedId}
            onClose={() => setSelectedId(null)}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <div className="p-4">
            {!projects ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filtered?.length === 0 ? (
              <EmptyState
                icon={<FolderKanban className="w-10 h-10" />}
                title={filter === "all" ? "No projects yet" : `No ${filter} projects`}
                description="Create a project to organize client deliverables"
                action={{ label: "New Project", onClick: () => setShowCreate(true) }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filtered?.map((project) => {
                  const sc = statusConfig[project.status as ProjectStatus];
                  return (
                    <div
                      key={project._id}
                      onClick={() => setSelectedId(project._id)}
                      className="p-3 bg-mc-bg-secondary border border-mc-border rounded hover:border-mc-accent/30 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">{typeEmoji[project.type] || "📁"}</span>
                          <span className="text-sm font-medium truncate text-mc-text">{project.name}</span>
                        </div>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 font-mono-jb font-semibold", sc.bg, sc.color)}>
                          {sc.label}
                        </span>
                      </div>
                      <div className="text-xs text-mc-text-secondary mb-2">
                        {project.client?.name ?? "No client"}
                        <span className="mx-1.5">·</span>
                        {project.type}
                      </div>
                      {project.brief && (
                        <p className="text-xs text-mc-muted line-clamp-2 mb-2">{project.brief}</p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-mc-muted font-mono-jb">
                        <span>{formatTime(project.createdAt)}</span>
                        {project.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); resetForm(); }} title="New Project" size="md">
        <form onSubmit={handleCreate} className="p-4 space-y-4">
          <div>
            <label className="text-[10px] text-mc-text-secondary uppercase tracking-wider mb-1 block font-mono-jb">Client</label>
            <select
              value={formClientId}
              onChange={(e) => setFormClientId(e.target.value)}
              className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
              required
            >
              <option value="">Select client...</option>
              {clients?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}{c.company ? ` (${c.company})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-mc-text-secondary uppercase tracking-wider mb-1 block font-mono-jb">Project Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Website Redesign"
              className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
              required
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-mc-text-secondary uppercase tracking-wider mb-1 block font-mono-jb">Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
              >
                <option value="research">Research</option>
                <option value="code">Code</option>
                <option value="content">Content</option>
                <option value="design">Design</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-mc-text-secondary uppercase tracking-wider mb-1 block font-mono-jb">Deadline</label>
              <input
                type="date"
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
                className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-mc-text-secondary uppercase tracking-wider mb-1 block font-mono-jb">Brief</label>
            <textarea
              value={formBrief}
              onChange={(e) => setFormBrief(e.target.value)}
              placeholder="Describe the project scope and requirements..."
              rows={3}
              className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setShowCreate(false); resetForm(); }}
              className="px-3 py-1.5 text-xs text-mc-text-secondary hover:text-mc-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formName.trim() || !formClientId || creating}
              className="px-4 py-1.5 text-xs bg-mc-accent text-white rounded hover:bg-mc-accent-hover disabled:opacity-50 transition-colors"
            >
              {creating ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// --- Project Detail Panel ---

function ProjectDetail({
  projectId,
  onClose,
  onStatusChange,
}: {
  projectId: Id<"projects">;
  onClose: () => void;
  onStatusChange: (id: Id<"projects">, status: ProjectStatus) => void;
}) {
  const project = useQuery(api.projects.withDetails, { id: projectId });
  const { addToast } = useToast();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);
  const [decomposing, setDecomposing] = useState(false);

  const handleDecompose = async () => {
    setDecomposing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/decompose`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        addToast(`Created ${data.taskIds.length} tasks`, "success");
      } else {
        addToast(data.error || "Failed to decompose", "error");
      }
    } catch {
      addToast("Failed to decompose project", "error");
    } finally {
      setDecomposing(false);
    }
  };

  if (!project) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/3 bg-mc-bg-tertiary rounded" />
          <div className="h-4 w-1/2 bg-mc-bg-tertiary rounded" />
        </div>
      </div>
    );
  }

  const sc = statusConfig[project.status as ProjectStatus];
  const statusOptions: ProjectStatus[] = ["intake", "active", "review", "delivered", "archived"];

  return (
    <div className="p-4 animate-fade-in">
      {/* Back */}
      <button
        onClick={onClose}
        className="text-[10px] text-mc-muted hover:text-mc-text mb-4 flex items-center gap-1 transition-colors font-mono-jb uppercase tracking-wider"
      >
        ← Back to projects
      </button>

      {/* Project Header */}
      <div className="bg-white border border-[#e8e5de] rounded-lg overflow-hidden mb-4">
        <div className="px-4 py-3 flex items-start justify-between border-b border-[#f0ede6]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-lg">{typeEmoji[project.type] || "📁"}</span>
              <h2 className="text-lg font-semibold text-[#1a1a1a]" style={{ fontFamily: 'Inter, sans-serif' }}>{project.name}</h2>
            </div>
            <div className="text-[12px] text-[#6b6560]">
              {project.client?.name ?? "Unknown client"}
              <span className="mx-1.5">·</span>
              {project.type}
              {project.deadline && (
                <>
                  <span className="mx-1.5">·</span>
                  Due {new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </>
              )}
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className={cn("text-[10px] px-2 py-1 rounded flex items-center gap-1 font-mono-jb font-semibold", sc.bg, sc.color)}
            >
              {sc.label}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-1 bg-mc-bg-secondary border border-mc-border rounded py-1 z-10 min-w-[120px] shadow-xl">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onStatusChange(projectId, s);
                      setShowStatusMenu(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs transition-colors capitalize",
                      project.status === s
                        ? "text-mc-accent bg-mc-accent/10"
                        : "text-mc-text-secondary hover:text-mc-text hover:bg-mc-bg-tertiary"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {project.brief && (
          <div className="px-4 py-3">
            <p className="text-sm text-mc-text-secondary leading-relaxed">{project.brief}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tasks */}
        <div className="bg-mc-bg-secondary border border-mc-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ede6]">
            <span className="text-[13px] font-semibold text-[#1a1a1a]">
              Tasks ({project.tasks?.length ?? 0})
            </span>
            <button
              onClick={handleDecompose}
              disabled={decomposing}
              className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded text-mc-accent hover:bg-mc-accent/10 disabled:opacity-50 transition-colors"
            >
              {decomposing ? (
                <Cog className="w-3 h-3 animate-spin" />
              ) : (
                <Bot className="w-3 h-3" />
              )}
              {decomposing ? "Decomposing..." : "Decompose"}
            </button>
          </div>
          <div className="divide-y divide-mc-border max-h-[400px] overflow-y-auto">
            {project.tasks?.length === 0 ? (
              <div className="p-4 text-xs text-mc-text-secondary text-center">No tasks yet</div>
            ) : (
              project.tasks?.map((task) => (
                <button
                  key={task._id}
                  onClick={() => setSelectedTaskId(task._id)}
                  className="w-full px-4 py-2 hover:bg-mc-bg-tertiary/50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-mc-text-secondary flex-shrink-0">
                        {taskTypeIcons[task.taskType ?? "general"] ?? taskTypeIcons.general}
                      </span>
                      <span className="text-sm truncate text-mc-text">{task.title}</span>
                    </div>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded capitalize font-mono-jb font-semibold flex-shrink-0",
                      task.status === "completed" ? "bg-mc-accent-green/12 text-mc-accent-green" :
                      task.status === "running" ? "bg-mc-accent-yellow/12 text-mc-accent-yellow" :
                      task.status === "failed" ? "bg-mc-accent-red/12 text-mc-accent-red" :
                      "bg-mc-bg-tertiary text-mc-text-secondary"
                    )}>
                      {task.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Deliverables */}
        <div className="bg-mc-bg-secondary border border-mc-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0ede6]">
            <span className="text-[13px] font-semibold text-[#1a1a1a]">
              Deliverables ({project.deliverables?.length ?? 0})
            </span>
          </div>
          <div className="divide-y divide-mc-border max-h-[400px] overflow-y-auto">
            {project.deliverables?.length === 0 ? (
              <div className="p-4 text-xs text-mc-text-secondary text-center">No deliverables yet</div>
            ) : (
              project.deliverables?.map((d) => (
                <div key={d._id} className="px-4 py-2 hover:bg-mc-bg-tertiary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <span className="text-sm truncate block text-mc-text">{d.title}</span>
                      <span className="text-[10px] text-mc-text-secondary font-mono-jb">{d.format}</span>
                    </div>
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded capitalize flex-shrink-0 ml-2 font-mono-jb font-semibold",
                      d.status === "approved" ? "bg-mc-accent-green/12 text-mc-accent-green" :
                      d.status === "review" ? "bg-mc-accent-yellow/12 text-mc-accent-yellow" :
                      d.status === "rejected" ? "bg-mc-accent-red/12 text-mc-accent-red" :
                      d.status === "delivered" ? "bg-mc-accent/12 text-mc-accent" :
                      "bg-mc-bg-tertiary text-mc-text-secondary"
                    )}>
                      {d.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Slide-over */}
      {selectedTaskId && (
        <TaskDetailPanel
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}
