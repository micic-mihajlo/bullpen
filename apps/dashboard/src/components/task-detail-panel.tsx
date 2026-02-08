"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { formatTime, formatTimestamp } from "@/lib/utils";
import { useStableData } from "@/lib/hooks";
import {
  X,
  Code2,
  Cog,
  Search,
  Palette,
  FileCheck2,
  FileText,
  Bot,
  Clock,
  Send,
  MessageSquare,
  AlertCircle,
  ArrowRightLeft,
  Compass,
  HelpCircle,
} from "lucide-react";

const taskTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  coding: { label: "Coding", icon: <Code2 className="w-3.5 h-3.5" />, color: "text-blue-600 bg-blue-50" },
  automation: { label: "Automation", icon: <Cog className="w-3.5 h-3.5" />, color: "text-purple-600 bg-purple-50" },
  research: { label: "Research", icon: <Search className="w-3.5 h-3.5" />, color: "text-emerald-600 bg-emerald-50" },
  design: { label: "Design", icon: <Palette className="w-3.5 h-3.5" />, color: "text-pink-600 bg-pink-50" },
  review: { label: "Review", icon: <FileCheck2 className="w-3.5 h-3.5" />, color: "text-amber-600 bg-amber-50" },
  general: { label: "General", icon: <FileText className="w-3.5 h-3.5" />, color: "text-[#6b6560] bg-[#f0ede6]" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-[#f0ede6] text-[#6b6560]" },
  assigned: { label: "Assigned", color: "bg-blue-50 text-blue-700" },
  running: { label: "Running", color: "bg-amber-50 text-amber-700" },
  completed: { label: "Completed", color: "bg-green-50 text-green-700" },
  failed: { label: "Failed", color: "bg-red-50 text-red-700" },
};

const messageTypeIcons: Record<string, React.ReactNode> = {
  update: <MessageSquare className="w-3 h-3" />,
  question: <HelpCircle className="w-3 h-3" />,
  decision: <AlertCircle className="w-3 h-3" />,
  handoff: <ArrowRightLeft className="w-3 h-3" />,
  steering: <Compass className="w-3 h-3" />,
};

interface TaskDetailPanelProps {
  taskId: Id<"tasks">;
  onClose: () => void;
}

export function TaskDetailPanel({ taskId, onClose }: TaskDetailPanelProps) {
  const task = useQuery(api.tasks.get, { id: taskId });
  const messages = useStableData(useQuery(api.agentMessages.listByTask, { taskId }));
  const sendMessage = useMutation(api.agentMessages.send);

  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage({
        taskId,
        fromAgent: "operator",
        toAgent: "all",
        message: msgText.trim(),
        messageType: "steering",
      });
      setMsgText("");
    } finally {
      setSending(false);
    }
  };

  if (!task) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative w-full max-w-lg bg-white shadow-xl animate-slide-in-right">
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-1/3 bg-[#f0ede6] rounded" />
              <div className="h-4 w-1/2 bg-[#f0ede6] rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const typeConf = taskTypeConfig[task.taskType ?? "general"] ?? taskTypeConfig.general;
  const statusConf = statusConfig[task.status] ?? statusConfig.pending;
  const elapsed = task.startedAt
    ? task.completedAt
      ? task.completedAt - task.startedAt
      : Date.now() - task.startedAt
    : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className="relative w-full max-w-lg bg-white shadow-xl flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-[#e8e5de] px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full", typeConf.color)}>
                  {typeConf.icon}
                  {typeConf.label}
                </span>
                <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", statusConf.color)}>
                  {statusConf.label}
                </span>
              </div>
              <h2 className="text-base font-semibold text-[#1a1a1a] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                {task.title}
              </h2>
              <div className="flex items-center gap-3 mt-1 text-xs text-[#6b6560]">
                {task.agent && (
                  <span className="flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    {task.agent.name}
                  </span>
                )}
                {elapsed !== null && (
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    {formatElapsed(elapsed)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-[#9c9590] hover:text-[#1a1a1a] rounded-lg hover:bg-[#f0ede6] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Description */}
          {task.description && (
            <div className="px-5 py-4 border-b border-[#f0ede6]">
              <p className="text-sm text-[#6b6560] leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Type-specific section */}
          <TypeSpecificSection taskType={task.taskType ?? "general"} liveContext={task.liveContext} />

          {/* Chat Thread */}
          <div className="px-5 py-4">
            <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-3">
              Thread
            </h3>
            {!messages || messages.length === 0 ? (
              <div className="text-xs text-[#9c9590] text-center py-6">
                No messages yet
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm",
                      msg.messageType === "steering"
                        ? "bg-[#c2410c]/5 border border-[#c2410c]/15 ml-6"
                        : "bg-[#faf9f6] border border-[#e8e5de] mr-6"
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[#9c9590]">{messageTypeIcons[msg.messageType]}</span>
                      <span className="text-[10px] font-medium text-[#6b6560]">{msg.fromAgent}</span>
                      <span className="text-[10px] text-[#9c9590]">{formatTimestamp(msg.timestamp)}</span>
                    </div>
                    <p className="text-[#1a1a1a] text-[13px] leading-relaxed">{msg.message}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Message input */}
        <div className="flex-shrink-0 border-t border-[#e8e5de] px-5 py-3">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              placeholder="Send steering message..."
              className="flex-1 bg-[#faf9f6] border border-[#e8e5de] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] placeholder:text-[#9c9590] focus:outline-none focus:border-[#c2410c]/40"
            />
            <button
              type="submit"
              disabled={!msgText.trim() || sending}
              className="px-3 py-2 bg-[#c2410c] text-white rounded-lg hover:bg-[#9a3412] disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function TypeSpecificSection({ taskType, liveContext }: { taskType: string; liveContext?: unknown }) {
  const ctx = liveContext as Record<string, unknown> | undefined;

  if (taskType === "coding") {
    return (
      <div className="px-5 py-4 border-b border-[#f0ede6]">
        <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-2">Code Changes</h3>
        {ctx?.filesChanged ? (
          <p className="text-sm text-[#1a1a1a] font-mono text-[12px]">{String(ctx.filesChanged)} files changed</p>
        ) : (
          <p className="text-xs text-[#9c9590]">No code changes tracked yet</p>
        )}
      </div>
    );
  }

  if (taskType === "automation") {
    return (
      <div className="px-5 py-4 border-b border-[#f0ede6]">
        <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-2">Pipeline</h3>
        {ctx?.nodeCount ? (
          <p className="text-sm text-[#1a1a1a]">{String(ctx.nodeCount)}-node pipeline</p>
        ) : (
          <p className="text-xs text-[#9c9590]">No pipeline data yet</p>
        )}
      </div>
    );
  }

  if (taskType === "research") {
    return (
      <div className="px-5 py-4 border-b border-[#f0ede6]">
        <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-2">Research</h3>
        {ctx?.sourcesFound ? (
          <p className="text-sm text-[#1a1a1a]">{String(ctx.sourcesFound)} sources found</p>
        ) : (
          <p className="text-xs text-[#9c9590]">No research data yet</p>
        )}
      </div>
    );
  }

  if (taskType === "design") {
    return (
      <div className="px-5 py-4 border-b border-[#f0ede6]">
        <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-2">Design</h3>
        {ctx?.revisionCount ? (
          <p className="text-sm text-[#1a1a1a]">{String(ctx.revisionCount)} revisions</p>
        ) : (
          <p className="text-xs text-[#9c9590]">No design data yet</p>
        )}
      </div>
    );
  }

  // general / review — no extra section
  return null;
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return `${hours}h ${remainMinutes}m`;
}
