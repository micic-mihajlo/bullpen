"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/utils";
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
  CheckCircle2,
  XCircle,
  Circle,
  Play,
  Loader2,
} from "lucide-react";

// ── Config ──

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

const messageTypeConfig: Record<string, { icon: React.ReactNode; label: string; avatarColor: string }> = {
  update: { icon: <MessageSquare className="w-3 h-3" />, label: "Update", avatarColor: "bg-blue-500" },
  question: { icon: <HelpCircle className="w-3 h-3" />, label: "Question", avatarColor: "bg-amber-500" },
  decision: { icon: <AlertCircle className="w-3 h-3" />, label: "Decision", avatarColor: "bg-green-500" },
  handoff: { icon: <ArrowRightLeft className="w-3 h-3" />, label: "Handoff", avatarColor: "bg-purple-500" },
  steering: { icon: <Compass className="w-3 h-3" />, label: "Steering", avatarColor: "bg-[#c2410c]" },
  step_review: { icon: <FileCheck2 className="w-3 h-3" />, label: "Review", avatarColor: "bg-emerald-500" },
};

const stepStatusIcon: Record<string, React.ReactNode> = {
  pending: <Circle className="w-3.5 h-3.5 text-[#9c9590]" />,
  in_progress: <Loader2 className="w-3.5 h-3.5 text-amber-500 animate-spin" />,
  review: <AlertCircle className="w-3.5 h-3.5 text-[#c2410c]" />,
  approved: <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />,
  rejected: <XCircle className="w-3.5 h-3.5 text-red-500" />,
};

// ── Main Component ──

interface TaskDetailPanelProps {
  taskId: Id<"tasks">;
  onClose: () => void;
}

export function TaskDetailPanel({ taskId, onClose }: TaskDetailPanelProps) {
  const task = useQuery(api.tasks.get, { id: taskId });
  const messages = useStableData(useQuery(api.agentMessages.listByTask, { taskId }));

  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [reviewingStep, setReviewingStep] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectInput, setShowRejectInput] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const handleSendSteering = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || sending) return;
    setSending(true);
    try {
      await fetch(`/api/tasks/${taskId}/steer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msgText.trim() }),
      });
      setMsgText("");
    } finally {
      setSending(false);
    }
  };

  const handleDispatch = async () => {
    setDispatching(true);
    try {
      await fetch(`/api/tasks/${taskId}/dispatch`, { method: "POST" });
    } finally {
      setDispatching(false);
    }
  };

  const handleReview = async (stepIndex: number, action: "approved" | "rejected", note?: string) => {
    setReviewingStep(stepIndex);
    try {
      await fetch(`/api/tasks/${taskId}/review-step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepIndex, action, note }),
      });
      setShowRejectInput(null);
      setRejectNote("");
    } finally {
      setReviewingStep(null);
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
              <div className="h-32 w-full bg-[#f0ede6] rounded mt-4" />
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
        className="relative w-full max-w-lg bg-white shadow-xl flex flex-col animate-slide-in-right h-full"
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
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Description */}
          {task.description && (
            <div className="px-5 py-4 border-b border-[#f0ede6]">
              <p className="text-sm text-[#6b6560] leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Dispatch button for pending tasks */}
          {(task.status === "pending" || task.status === "assigned") && (
            <div className="px-5 py-3 border-b border-[#f0ede6]">
              <button
                onClick={handleDispatch}
                disabled={dispatching}
                className="flex items-center gap-2 px-4 py-2 text-xs bg-[#c2410c] text-white rounded-lg hover:bg-[#9a3412] disabled:opacity-50 transition-colors font-medium w-full justify-center"
              >
                {dispatching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                {dispatching ? "Dispatching..." : "Dispatch Worker"}
              </button>
            </div>
          )}

          {/* Steps */}
          {task.steps && task.steps.length > 0 && (
            <div className="px-5 py-4 border-b border-[#f0ede6]">
              <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-3">
                Steps ({task.steps.filter((s) => s.status === "approved").length}/{task.steps.length})
              </h3>
              <div className="space-y-2">
                {task.steps.map((step, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-lg border px-3 py-2.5",
                      step.status === "review" ? "border-[#c2410c]/30 bg-[#c2410c]/5" :
                      step.status === "in_progress" ? "border-amber-300 bg-amber-50/50" :
                      step.status === "approved" ? "border-green-200 bg-green-50/30" :
                      step.status === "rejected" ? "border-red-200 bg-red-50/30" :
                      "border-[#e8e5de] bg-[#faf9f6]"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 mt-0.5">
                        {stepStatusIcon[step.status] ?? stepStatusIcon.pending}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] font-medium text-[#1a1a1a]">
                            {i + 1}. {step.name}
                          </span>
                          <span className={cn(
                            "text-[9px] font-mono font-medium px-1.5 py-0.5 rounded capitalize",
                            step.status === "approved" ? "text-green-700 bg-green-100" :
                            step.status === "rejected" ? "text-red-700 bg-red-100" :
                            step.status === "review" ? "text-[#c2410c] bg-[#c2410c]/10" :
                            step.status === "in_progress" ? "text-amber-700 bg-amber-100" :
                            "text-[#9c9590] bg-[#f0ede6]"
                          )}>
                            {step.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6b6560] mt-0.5">{step.description}</p>
                        {step.agentOutput && (
                          <div className="mt-2 text-[11px] text-[#1a1a1a] bg-white border border-[#e8e5de] rounded p-2 font-mono">
                            {step.agentOutput}
                          </div>
                        )}
                        {step.reviewNote && (
                          <div className="mt-1.5 text-[11px] text-[#6b6560] italic">
                            Review: {step.reviewNote}
                          </div>
                        )}

                        {/* Review actions for steps in review status */}
                        {step.status === "review" && (
                          <div className="mt-2">
                            {showRejectInput === i ? (
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  value={rejectNote}
                                  onChange={(e) => setRejectNote(e.target.value)}
                                  placeholder="Rejection reason..."
                                  className="flex-1 text-[11px] border border-[#e8e5de] rounded px-2 py-1 focus:outline-none focus:border-[#c2410c]/40"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleReview(i, "rejected", rejectNote)}
                                  disabled={reviewingStep === i}
                                  className="text-[10px] px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => { setShowRejectInput(null); setRejectNote(""); }}
                                  className="text-[10px] px-2 py-1 text-[#9c9590] hover:text-[#1a1a1a]"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReview(i, "approved")}
                                  disabled={reviewingStep === i}
                                  className="flex items-center gap-1 text-[10px] px-2.5 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium"
                                >
                                  {reviewingStep === i ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-3 h-3" />
                                  )}
                                  Approve
                                </button>
                                <button
                                  onClick={() => setShowRejectInput(i)}
                                  disabled={reviewingStep === i}
                                  className="flex items-center gap-1 text-[10px] px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50 font-medium"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Thread */}
          <div className="px-5 py-4">
            <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-3">
              Thread
            </h3>
            {!messages || messages.length === 0 ? (
              <div className="text-xs text-[#9c9590] text-center py-6 border border-dashed border-[#e8e5de] rounded-lg">
                No messages yet
              </div>
            ) : (
              <div className="space-y-2.5">
                {messages.map((msg) => {
                  const mtConf = messageTypeConfig[msg.messageType] ?? messageTypeConfig.update;
                  const isSteering = msg.messageType === "steering";
                  return (
                    <div
                      key={msg._id}
                      className={cn(
                        "rounded-lg px-3 py-2.5 text-sm border",
                        isSteering
                          ? "bg-[#c2410c]/5 border-[#c2410c]/15 ml-8"
                          : msg.messageType === "question"
                            ? "bg-amber-50/50 border-amber-200 mr-4"
                            : msg.messageType === "decision"
                              ? "bg-green-50/50 border-green-200 mr-4"
                              : msg.messageType === "step_review"
                                ? "bg-emerald-50/50 border-emerald-200 mr-4"
                                : "bg-[#faf9f6] border-[#e8e5de] mr-4"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0",
                          mtConf.avatarColor
                        )}>
                          {msg.fromAgent.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-[11px] font-medium text-[#1a1a1a]">{msg.fromAgent}</span>
                        <span className={cn(
                          "inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full",
                          isSteering ? "bg-[#c2410c]/10 text-[#c2410c]"
                            : msg.messageType === "question" ? "bg-amber-100 text-amber-700"
                            : msg.messageType === "decision" ? "bg-green-100 text-green-700"
                            : msg.messageType === "step_review" ? "bg-emerald-100 text-emerald-700"
                            : "bg-[#f0ede6] text-[#6b6560]"
                        )}>
                          {mtConf.icon}
                          {mtConf.label}
                        </span>
                        <span className="text-[10px] text-[#9c9590] ml-auto font-mono">{formatTimestamp(msg.timestamp)}</span>
                      </div>
                      <p className="text-[#1a1a1a] text-[13px] leading-relaxed pl-7">{msg.message}</p>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Steering input */}
        <div className="flex-shrink-0 border-t border-[#e8e5de] px-5 py-3 bg-white">
          <form onSubmit={handleSendSteering} className="flex gap-2">
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

// ── Utils ──

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return `${hours}h ${remainMinutes}m`;
}
