"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { useStableData } from "@/lib/hooks";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/toast";
import { useRegisterShortcut } from "@/components/shortcuts-provider";

type WorkerTemplate = {
  _id: string;
  name: string;
  displayName: string;
  role: string;
  status: "active" | "draft";
  taskTypes: string[];
  model: string;
  tools: string[];
  skills: string[];
  systemPrompt: string;
  reviewEvery: number;
  maxParallel: number;
};

type FilterTab = "all" | "active" | "draft";

const MODEL_OPTIONS = [
  { value: "cerebras/zai-glm-4.7", label: "Cerebras" },
  { value: "anthropic/claude-opus-4-5", label: "Opus" },
  { value: "anthropic/claude-sonnet-4-20250514", label: "Sonnet" },
];

const AVATARS = ["🤖", "🦾", "🧠", "👾", "🎯", "⚡", "🔮", "🦊", "🐙", "🌟"];

export function AgentList() {
  const agents = useStableData(useQuery(api.workerTemplates.list));
  const createTemplate = useMutation(api.workerTemplates.create);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newAvatar, setNewAvatar] = useState("🤖");
  const [newModel, setNewModel] = useState("cerebras/zai-glm-4.7");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<WorkerTemplate | null>(null);
  const { addToast } = useToast();

  const openModal = useCallback(() => setShowModal(true), []);
  useRegisterShortcut("newAgent", openModal);

  const filtered = agents?.filter((a) => {
    if (filter === "all") return true;
    if (filter === "active") return a.status === "active";
    return a.status === "draft";
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      await createTemplate({
        name: newName.trim().toLowerCase().replace(/\s+/g, "-"),
        displayName: newName.trim(),
        role: newRole || "General purpose worker",
        taskTypes: ["general"],
        model: newModel,
        tools: ["exec"],
        skills: [],
        systemPrompt: newRole ? `# ${newName.trim()}\n\n${newRole}` : `# ${newName.trim()}`,
        reviewEvery: 3,
        maxParallel: 2,
      });
      addToast(`Template ${newName.trim()} created`, "success");
      setNewName("");
      setNewRole("");
      setNewAvatar("🤖");
      setNewModel("cerebras/zai-glm-4.7");
      setShowModal(false);
    } catch {
      addToast("Failed to create agent", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const getRole = (template: WorkerTemplate) => {
    return template.role;
  };

  const activeCount = agents?.filter((a) => a.status === "active").length ?? 0;

  return (
    <>
      <div className="h-full flex flex-col bg-mc-bg-secondary border border-mc-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-2.5 border-b border-mc-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-mc-text-secondary uppercase tracking-wider font-mono-jb">
              Agents ({agents?.length ?? 0})
            </span>
            {activeCount > 0 && (
              <span className="text-[10px] text-mc-accent-green font-mono-jb font-semibold">{activeCount} active</span>
            )}
          </div>
          <div className="flex gap-0.5">
            {(["all", "active", "draft"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "px-2 py-1 text-[10px] rounded transition-colors font-mono-jb capitalize",
                  filter === tab
                    ? "bg-mc-accent/10 text-mc-accent border border-mc-accent/30 font-medium"
                    : "text-mc-text-secondary hover:text-mc-text hover:bg-mc-bg-tertiary"
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
            <div className="p-2 text-[10px] text-mc-text-secondary font-mono-jb">Loading...</div>
          ) : filtered?.length === 0 ? (
            <div className="p-4 text-[10px] text-mc-text-secondary text-center font-mono-jb">No agents</div>
          ) : (
            filtered?.map((agent) => {
              const t = agent as WorkerTemplate;
              return (
                <div
                  key={t._id}
                  onClick={() => setSelectedAgent(t)}
                  className="flex items-center gap-2 p-2 rounded hover:bg-mc-bg-tertiary transition-colors cursor-pointer"
                >
                  <span className="text-xl">🤖</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium truncate text-mc-text">{t.displayName}</span>
                    </div>
                    <div className="text-[10px] text-mc-text-secondary truncate font-mono-jb">
                      {t.role}
                      {t.skills.length > 0 && ` · ${t.skills.slice(0, 2).join(", ")}`}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      t.status === "active" ? "bg-mc-accent-green" : "bg-mc-border"
                    )} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add button */}
        <div className="p-2 border-t border-mc-border">
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[10px] text-mc-text-secondary hover:text-mc-text hover:bg-mc-bg-tertiary rounded transition-colors font-mono-jb uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            Add agent
          </button>
        </div>
      </div>

      {/* Quick Create Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Agent" size="sm">
        <form onSubmit={handleCreate} className="p-3 space-y-3">
          <div className="flex gap-1.5 flex-wrap">
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
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
            autoFocus
          />
          <input
            type="text"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            placeholder="Role (e.g. Researcher, Developer)"
            className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
          />
          <select
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
            className="w-full bg-mc-bg border border-mc-border rounded px-3 py-1.5 text-sm text-mc-text focus:outline-none focus:border-mc-accent"
          >
            {MODEL_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs text-mc-text-secondary hover:text-mc-text transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newName.trim() || isCreating}
              className="px-4 py-1.5 text-xs bg-mc-accent text-white rounded hover:bg-mc-accent-hover disabled:opacity-50 font-mono-jb uppercase tracking-wider"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {/* TODO: Worker template detail modal */}
    </>
  );
}
