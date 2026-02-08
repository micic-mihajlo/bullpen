"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
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
  ExternalLink,
  Plus,
  Minus,
  ArrowRight,
  Globe,
  FileCode,
  ChevronRight,
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

const messageTypeConfig: Record<string, { icon: React.ReactNode; label: string; borderColor: string; avatarColor: string }> = {
  update: { icon: <MessageSquare className="w-3 h-3" />, label: "Update", borderColor: "border-[#e8e5de]", avatarColor: "bg-blue-500" },
  question: { icon: <HelpCircle className="w-3 h-3" />, label: "Question", borderColor: "border-amber-300", avatarColor: "bg-amber-500" },
  decision: { icon: <AlertCircle className="w-3 h-3" />, label: "Decision", borderColor: "border-green-300", avatarColor: "bg-green-500" },
  handoff: { icon: <ArrowRightLeft className="w-3 h-3" />, label: "Handoff", borderColor: "border-purple-300", avatarColor: "bg-purple-500" },
  steering: { icon: <Compass className="w-3 h-3" />, label: "Steering", borderColor: "border-[#c2410c]/30", avatarColor: "bg-[#c2410c]" },
};

// ── Mock Data ──

const mockCodingFiles = [
  { name: "src/app/page.tsx", status: "modified" as const },
  { name: "src/components/auth.tsx", status: "added" as const },
  { name: "src/lib/api-client.ts", status: "modified" as const },
  { name: "src/styles/auth.css", status: "added" as const },
  { name: "tests/auth.test.ts", status: "added" as const },
];

const mockDiff = `@@ -12,6 +12,18 @@ export default function Page() {
   return (
     <main className="flex min-h-screen">
+      <AuthProvider>
+        <Sidebar />
+        <div className="flex-1 p-6">
+          <Header user={session.user} />
           <Dashboard />
+        </div>
+      </AuthProvider>
     </main>
   );
 }
-
-// TODO: Add authentication`;

const mockPipelineNodes = [
  { name: "Webhook Trigger", type: "webhook" },
  { name: "Filter Data", type: "filter" },
  { name: "Transform", type: "code" },
  { name: "Send to Slack", type: "slack" },
];

const mockResearchQueries = [
  { query: "best practices React server components 2026", timestamp: Date.now() - 3600000 },
  { query: "Next.js 15 streaming SSR patterns", timestamp: Date.now() - 2400000 },
  { query: "Convex real-time subscriptions optimization", timestamp: Date.now() - 1200000 },
];

const mockSources = [
  { url: "https://nextjs.org/docs/app/building-your-application", title: "Next.js App Router Docs", relevance: 95 },
  { url: "https://docs.convex.dev/realtime", title: "Convex Real-time Guide", relevance: 88 },
  { url: "https://react.dev/reference/rsc/server-components", title: "React Server Components", relevance: 82 },
  { url: "https://vercel.com/blog/streaming-ssr", title: "Streaming SSR in Practice", relevance: 74 },
];

const mockDesignRevisions = [
  { id: 1, label: "Initial layout draft", timestamp: Date.now() - 7200000 },
  { id: 2, label: "Updated color palette", timestamp: Date.now() - 3600000 },
  { id: 3, label: "Responsive breakpoints", timestamp: Date.now() - 1800000 },
];

// ── Pipeline node colors ──

const pipelineNodeColors: Record<string, string> = {
  webhook: "bg-[#c2410c]",
  filter: "bg-amber-400",
  code: "bg-green-500",
  slack: "bg-purple-500",
  http: "bg-blue-500",
};

// ── File status colors ──

const fileStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  modified: { label: "M", color: "text-amber-600 bg-amber-50", icon: <FileCode className="w-3 h-3" /> },
  added: { label: "A", color: "text-green-600 bg-green-50", icon: <Plus className="w-3 h-3" /> },
  deleted: { label: "D", color: "text-red-600 bg-red-50", icon: <Minus className="w-3 h-3" /> },
};

// ── Main Component ──

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

          {/* Type-specific section */}
          <TypeSpecificSection taskType={task.taskType ?? "general"} liveContext={task.liveContext} result={task.result} />

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
                              : "bg-[#faf9f6] border-[#e8e5de] mr-4"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        {/* Avatar circle */}
                        <span className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0",
                          mtConf.avatarColor
                        )}>
                          {msg.fromAgent.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-[11px] font-medium text-[#1a1a1a]">{msg.fromAgent}</span>
                        {/* Message type badge */}
                        <span className={cn(
                          "inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full",
                          isSteering ? "bg-[#c2410c]/10 text-[#c2410c]"
                            : msg.messageType === "question" ? "bg-amber-100 text-amber-700"
                            : msg.messageType === "decision" ? "bg-green-100 text-green-700"
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

        {/* Message input */}
        <div className="flex-shrink-0 border-t border-[#e8e5de] px-5 py-3 bg-white">
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

// ── Type-Specific Sections ──

function TypeSpecificSection({ taskType, liveContext, result }: { taskType: string; liveContext?: unknown; result?: string | null }) {
  switch (taskType) {
    case "coding":
      return <CodingView liveContext={liveContext} />;
    case "automation":
      return <AutomationView liveContext={liveContext} />;
    case "research":
      return <ResearchView liveContext={liveContext} />;
    case "design":
      return <DesignView liveContext={liveContext} />;
    case "review":
      return <ReviewView liveContext={liveContext} result={result} />;
    default:
      return <GeneralView liveContext={liveContext} result={result} />;
  }
}

// ── Coding View ──

function CodingView({ liveContext }: { liveContext?: unknown }) {
  const ctx = liveContext as Record<string, unknown> | undefined;
  const files = (ctx?.files as typeof mockCodingFiles) ?? mockCodingFiles;
  const diff = (ctx?.diff as string) ?? mockDiff;

  const addedLines = diff.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++")).length;
  const removedLines = diff.split("\n").filter((l) => l.startsWith("-") && !l.startsWith("---")).length;

  return (
    <div className="border-b border-[#f0ede6]">
      {/* File List */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider">Changed Files</h3>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-green-600 flex items-center gap-0.5">
              <Plus className="w-3 h-3" />{addedLines}
            </span>
            <span className="text-red-500 flex items-center gap-0.5">
              <Minus className="w-3 h-3" />{removedLines}
            </span>
          </div>
        </div>
        <div className="space-y-1">
          {files.map((file) => {
            const fConf = fileStatusConfig[file.status] ?? fileStatusConfig.modified;
            return (
              <div key={file.name} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-[#faf9f6] transition-colors">
                <span className={cn("text-[10px] font-bold w-4 text-center", fConf.color)}>{fConf.label}</span>
                <span className="text-[12px] font-mono text-[#1a1a1a] truncate">{file.name}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-3 text-[11px] text-[#9c9590]">
          <span>{files.length} files changed</span>
          <span className="text-[#e8e5de]">|</span>
          <span className="text-green-600">+{addedLines}</span>
          <span className="text-red-500">-{removedLines}</span>
        </div>
      </div>

      {/* Diff Preview */}
      <div className="px-5 pb-4">
        <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-2">Diff Preview</h3>
        <pre className="text-[11px] font-mono leading-relaxed bg-[#faf9f6] border border-[#e8e5de] rounded-lg p-3 overflow-x-auto max-h-[200px] overflow-y-auto">
          {diff.split("\n").map((line, i) => {
            const isAdd = line.startsWith("+") && !line.startsWith("+++");
            const isDel = line.startsWith("-") && !line.startsWith("---");
            const isHeader = line.startsWith("@@");
            return (
              <div
                key={i}
                className={cn(
                  "px-1 -mx-1 rounded-sm",
                  isAdd && "bg-green-50 text-green-800",
                  isDel && "bg-red-50 text-red-700",
                  isHeader && "text-blue-600 font-medium",
                  !isAdd && !isDel && !isHeader && "text-[#6b6560]"
                )}
              >
                {line}
              </div>
            );
          })}
        </pre>
      </div>

      {/* Preview Link */}
      <div className="px-5 pb-4">
        <button className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#c2410c] hover:text-[#9a3412] transition-colors">
          <ExternalLink className="w-3.5 h-3.5" />
          Open Preview
        </button>
      </div>
    </div>
  );
}

// ── Automation View ──

function AutomationView({ liveContext }: { liveContext?: unknown }) {
  const ctx = liveContext as Record<string, unknown> | undefined;
  const nodes = (ctx?.nodes as typeof mockPipelineNodes) ?? mockPipelineNodes;
  const isActive = (ctx?.pipelineActive as boolean) ?? true;

  return (
    <div className="px-5 py-4 border-b border-[#f0ede6]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider">Pipeline</h3>
        <span className={cn(
          "text-[10px] font-medium px-2 py-0.5 rounded-full",
          isActive ? "bg-green-50 text-green-700" : "bg-[#f0ede6] text-[#6b6560]"
        )}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Pipeline Visualization */}
      <div className="bg-[#faf9f6] border border-[#e8e5de] rounded-lg p-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {nodes.map((node, i) => {
            const dotColor = pipelineNodeColors[node.type] ?? "bg-gray-400";
            return (
              <div key={i} className="flex items-center gap-1 flex-shrink-0">
                <div className="flex flex-col items-center gap-1.5 px-3 py-2 bg-white border border-[#e8e5de] rounded-lg min-w-[100px]">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("w-2 h-2 rounded-full flex-shrink-0", dotColor)} />
                    <span className="text-[11px] font-medium text-[#1a1a1a] whitespace-nowrap">{node.name}</span>
                  </div>
                  <span className="text-[9px] text-[#9c9590] uppercase tracking-wider">{node.type}</span>
                </div>
                {i < nodes.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-[#9c9590] flex-shrink-0 mx-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-[11px] text-[#9c9590]">
        {nodes.length}-node pipeline
      </div>
    </div>
  );
}

// ── Research View ──

function ResearchView({ liveContext }: { liveContext?: unknown }) {
  const ctx = liveContext as Record<string, unknown> | undefined;
  const queries = (ctx?.queries as typeof mockResearchQueries) ?? mockResearchQueries;
  const sources = (ctx?.sources as typeof mockSources) ?? mockSources;
  const synthesis = (ctx?.synthesis as string) ?? "Based on the analysis of 4 sources, React Server Components provide significant benefits for data-heavy pages. The recommended approach combines streaming SSR with Convex real-time subscriptions for optimal UX...";
  const synthesisProgress = (ctx?.synthesisProgress as number) ?? 68;

  return (
    <div className="border-b border-[#f0ede6]">
      {/* Search Queries */}
      <div className="px-5 py-4 border-b border-[#f0ede6]">
        <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-2">Search Queries</h3>
        <div className="space-y-1.5">
          {queries.map((q, i) => (
            <div key={i} className="flex items-start gap-2 py-1">
              <Search className="w-3 h-3 text-[#9c9590] mt-0.5 flex-shrink-0" />
              <span className="text-[12px] text-[#1a1a1a] flex-1">{q.query}</span>
              <span className="text-[10px] text-[#9c9590] font-mono flex-shrink-0">{formatTimestamp(q.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sources Found */}
      <div className="px-5 py-4 border-b border-[#f0ede6]">
        <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-2">Sources Found</h3>
        <div className="space-y-1.5">
          {sources.map((s, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-[#faf9f6] transition-colors">
              <Globe className="w-3 h-3 text-[#9c9590] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[12px] font-medium text-[#1a1a1a] block truncate">{s.title}</span>
                <span className="text-[10px] text-[#9c9590] font-mono truncate block">{s.url}</span>
              </div>
              <span className={cn(
                "text-[10px] font-mono font-medium flex-shrink-0 px-1.5 py-0.5 rounded",
                s.relevance >= 90 ? "text-green-700 bg-green-50"
                  : s.relevance >= 75 ? "text-amber-700 bg-amber-50"
                  : "text-[#6b6560] bg-[#f0ede6]"
              )}>
                {s.relevance}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Synthesis */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider">Synthesis</h3>
          <span className="text-[10px] font-mono text-[#c2410c]">{synthesisProgress}%</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1 bg-[#f0ede6] rounded-full mb-3">
          <div
            className="h-1 bg-[#c2410c] rounded-full transition-all"
            style={{ width: `${synthesisProgress}%` }}
          />
        </div>
        <p className="text-[12px] text-[#6b6560] leading-relaxed bg-[#faf9f6] border border-[#e8e5de] rounded-lg p-3">
          {synthesis}
        </p>
        <div className="flex items-center gap-3 mt-3 text-[11px] text-[#9c9590]">
          <span>{queries.length} queries run</span>
          <span className="text-[#e8e5de]">|</span>
          <span>{sources.length} sources found</span>
        </div>
      </div>
    </div>
  );
}

// ── Design View ──

function DesignView({ liveContext }: { liveContext?: unknown }) {
  const ctx = liveContext as Record<string, unknown> | undefined;
  const revisions = (ctx?.revisions as typeof mockDesignRevisions) ?? mockDesignRevisions;
  const feedbackNotes = (ctx?.feedbackNotes as string) ?? "Looks great overall. Consider increasing contrast on the secondary buttons and aligning the card grid to an 8px baseline.";

  return (
    <div className="border-b border-[#f0ede6]">
      {/* Screenshot Preview */}
      <div className="px-5 py-4 border-b border-[#f0ede6]">
        <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-2">Preview</h3>
        <div className="bg-[#f0ede6] border border-[#e8e5de] rounded-lg flex items-center justify-center h-[180px] relative overflow-hidden">
          <div className="text-center">
            <Palette className="w-6 h-6 text-[#9c9590] mx-auto mb-1" />
            <span className="text-[11px] text-[#9c9590]">1440 x 900</span>
          </div>
          <span className="absolute bottom-2 right-2 text-[9px] text-[#9c9590] font-mono">preview.png</span>
        </div>
      </div>

      {/* Revision History */}
      <div className="px-5 py-4 border-b border-[#f0ede6]">
        <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-2">Revision History</h3>
        <div className="space-y-1">
          {revisions.map((rev) => (
            <div key={rev.id} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-[#faf9f6] transition-colors">
              <span className="text-[10px] font-mono text-[#9c9590] w-5">v{rev.id}</span>
              <ChevronRight className="w-3 h-3 text-[#e8e5de]" />
              <span className="text-[12px] text-[#1a1a1a] flex-1">{rev.label}</span>
              <span className="text-[10px] text-[#9c9590] font-mono">{formatTimestamp(rev.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Notes */}
      <div className="px-5 py-4">
        <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-2">Feedback</h3>
        <p className="text-[12px] text-[#6b6560] leading-relaxed bg-[#faf9f6] border border-[#e8e5de] rounded-lg p-3">
          {feedbackNotes}
        </p>
      </div>
    </div>
  );
}

// ── Review / General Views ──

function ReviewView({ liveContext, result }: { liveContext?: unknown; result?: string | null }) {
  const ctx = liveContext as Record<string, unknown> | undefined;
  const description = (ctx?.description as string) ?? null;
  const output = (ctx?.output as string) ?? result ?? null;

  const timelineSteps = [
    { label: "Created", done: true },
    { label: "Assigned", done: true },
    { label: "In Review", done: true },
    { label: "Approved", done: false },
  ];

  return (
    <div className="border-b border-[#f0ede6]">
      {description && (
        <div className="px-5 py-4 border-b border-[#f0ede6]">
          <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-2">Description</h3>
          <p className="text-[12px] text-[#6b6560] leading-relaxed">{description}</p>
        </div>
      )}

      {output && (
        <div className="px-5 py-4 border-b border-[#f0ede6]">
          <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-2">Output</h3>
          <div className="text-[12px] text-[#1a1a1a] leading-relaxed bg-[#faf9f6] border border-[#e8e5de] rounded-lg p-3 font-mono">
            {output}
          </div>
        </div>
      )}

      {/* Status Timeline */}
      <div className="px-5 py-4">
        <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-3">Timeline</h3>
        <div className="flex items-center gap-0">
          {timelineSteps.map((step, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <span className={cn(
                  "w-3 h-3 rounded-full border-2",
                  step.done ? "bg-[#c2410c] border-[#c2410c]" : "bg-white border-[#e8e5de]"
                )} />
                <span className={cn(
                  "text-[9px] whitespace-nowrap",
                  step.done ? "text-[#1a1a1a] font-medium" : "text-[#9c9590]"
                )}>
                  {step.label}
                </span>
              </div>
              {i < timelineSteps.length - 1 && (
                <div className={cn(
                  "w-8 h-0.5 mx-1 mt-[-12px]",
                  step.done ? "bg-[#c2410c]" : "bg-[#e8e5de]"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GeneralView({ liveContext, result }: { liveContext?: unknown; result?: string | null }) {
  const ctx = liveContext as Record<string, unknown> | undefined;
  const output = (ctx?.output as string) ?? result ?? null;

  const timelineSteps = [
    { label: "Created", done: true },
    { label: "Assigned", done: true },
    { label: "Running", done: true },
    { label: "Done", done: false },
  ];

  return (
    <div className="border-b border-[#f0ede6]">
      {output && (
        <div className="px-5 py-4 border-b border-[#f0ede6]">
          <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-2">Result</h3>
          <div className="text-[12px] text-[#1a1a1a] leading-relaxed bg-[#faf9f6] border border-[#e8e5de] rounded-lg p-3">
            {output}
          </div>
        </div>
      )}

      <div className="px-5 py-4">
        <h3 className="text-[11px] font-semibold text-[#9c9590] uppercase tracking-wider mb-3">Status</h3>
        <div className="flex items-center gap-0">
          {timelineSteps.map((step, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <span className={cn(
                  "w-3 h-3 rounded-full border-2",
                  step.done ? "bg-[#c2410c] border-[#c2410c]" : "bg-white border-[#e8e5de]"
                )} />
                <span className={cn(
                  "text-[9px] whitespace-nowrap",
                  step.done ? "text-[#1a1a1a] font-medium" : "text-[#9c9590]"
                )}>
                  {step.label}
                </span>
              </div>
              {i < timelineSteps.length - 1 && (
                <div className={cn(
                  "w-8 h-0.5 mx-1 mt-[-12px]",
                  step.done ? "bg-[#c2410c]" : "bg-[#e8e5de]"
                )} />
              )}
            </div>
          ))}
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
