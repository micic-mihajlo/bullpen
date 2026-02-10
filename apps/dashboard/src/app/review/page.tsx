"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import { useStableData } from "@/lib/hooks";
import { EmptyState } from "@/components/empty-state";
import { SkeletonList } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/toast";
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Code2,
  GitBranch,
  Workflow,
  ExternalLink,
  FolderOpen,
  Copy,
  ClipboardCheck,
} from "lucide-react";

const artifactIcons: Record<string, React.ReactNode> = {
  repo: <GitBranch className="w-4 h-4" />,
  workflow: <Workflow className="w-4 h-4" />,
  document: <FileText className="w-4 h-4" />,
  files: <FolderOpen className="w-4 h-4" />,
  preview: <Eye className="w-4 h-4" />,
};

const artifactLabels: Record<string, string> = {
  repo: "GitHub Repository",
  workflow: "n8n Workflow",
  document: "Document",
  files: "Files",
  preview: "Live Preview",
};

export default function ReviewPage() {
  const allDeliverables = useStableData(useQuery(api.deliverables.list));
  const approveDeliverable = useMutation(api.deliverables.approve);
  const rejectDeliverable = useMutation(api.deliverables.reject);
  const deliverDeliverable = useMutation(api.deliverables.deliver);
  const { addToast } = useToast();

  const [selectedId, setSelectedId] = useState<Id<"deliverables"> | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectId, setRejectId] = useState<Id<"deliverables"> | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [filter, setFilter] = useState<"review" | "approved" | "all">("review");

  const filtered = allDeliverables?.filter((d) => {
    if (filter === "all") return true;
    return d.status === filter;
  }) ?? [];

  const reviewCount = allDeliverables?.filter((d) => d.status === "review").length ?? 0;
  const approvedCount = allDeliverables?.filter((d) => d.status === "approved").length ?? 0;

  const selectedDeliverable = allDeliverables?.find((d) => d._id === selectedId);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApprove = async (id: Id<"deliverables">) => {
    setProcessing(id);
    try {
      await approveDeliverable({ id, reviewedBy: "operator" });
      addToast("Deliverable approved", "success");
    } catch {
      addToast("Failed to approve", "error");
    } finally {
      setProcessing(null);
    }
  };

  const handleDeliver = async (id: Id<"deliverables">) => {
    setProcessing(id);
    try {
      await deliverDeliverable({ id });
      addToast("Deliverable marked as delivered", "success");
    } catch {
      addToast("Failed to deliver", "error");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectNotes.trim()) return;
    setProcessing(rejectId);
    try {
      await rejectDeliverable({ id: rejectId, reviewNotes: rejectNotes.trim() });
      addToast("Deliverable rejected with notes", "success");
      setShowReject(false);
      setRejectId(null);
      setRejectNotes("");
      if (selectedId === rejectId) setSelectedId(null);
    } catch {
      addToast("Failed to reject", "error");
    } finally {
      setProcessing(null);
    }
  };

  const openReject = (id: Id<"deliverables">) => {
    setRejectId(id);
    setRejectNotes("");
    setShowReject(true);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[#e8e5de] bg-white/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#1a1a1a]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Deliverables
            </h1>
            <p className="text-[12px] text-[#9c9590] mt-0.5">
              {reviewCount > 0 ? `${reviewCount} awaiting review` : "all reviewed"}
            </p>
          </div>
          <div className="flex gap-1 bg-[#f5f3ee] rounded-lg p-0.5">
            {(["review", "approved", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-md transition-colors capitalize",
                  filter === f
                    ? "bg-white text-[#1a1a1a] shadow-sm font-medium"
                    : "text-[#9c9590] hover:text-[#6b6560]"
                )}
              >
                {f === "review" ? `Review (${reviewCount})` : f === "approved" ? `Approved (${approvedCount})` : "All"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* List */}
        <div className={cn(
          "flex-shrink-0 border-r border-[#e8e5de] overflow-y-auto",
          selectedId ? "w-80" : "w-full max-w-3xl mx-auto"
        )}>
          {!allDeliverables ? (
            <div className="p-4"><SkeletonList count={5} /></div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<FileCheck2 className="w-10 h-10" />}
              title={filter === "review" ? "No deliverables to review" : "No deliverables"}
              description={filter === "review" ? "All deliverables have been reviewed." : "No deliverables yet."}
              className="h-full"
            />
          ) : (
            <div className="divide-y divide-[#e8e5de]">
              {filtered.map((d) => (
                <div
                  key={d._id}
                  onClick={() => setSelectedId(d._id)}
                  className={cn(
                    "px-4 py-3 cursor-pointer transition-colors",
                    selectedId === d._id
                      ? "bg-[#c2410c]/5 border-l-[3px] border-l-[#c2410c]"
                      : "hover:bg-[#faf9f6]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-[#9c9590]">
                      {artifactIcons[d.artifactType ?? d.format] ?? <FileText className="w-4 h-4" />}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate text-[#1a1a1a]">{d.title}</span>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0",
                          d.status === "review" && "bg-[#c2410c]/10 text-[#c2410c]",
                          d.status === "approved" && "bg-emerald-100 text-emerald-700",
                          d.status === "delivered" && "bg-blue-100 text-blue-700",
                          d.status === "draft" && "bg-[#f5f3ee] text-[#9c9590]",
                          d.status === "rejected" && "bg-red-100 text-red-700"
                        )}>
                          {d.status}
                        </span>
                      </div>
                      <div className="text-xs text-[#9c9590] mt-0.5">
                        {d.project?.name ?? "Unknown project"}
                        {d.client && ` · ${d.client.name}`}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {d.artifactType && (
                          <span className="text-[10px] text-[#6b6560] bg-[#f5f3ee] px-1.5 py-0.5 rounded">
                            {artifactLabels[d.artifactType] ?? d.artifactType}
                          </span>
                        )}
                        {d.artifactUrl && (
                          <span className="text-[10px] text-[#c2410c] truncate max-w-[180px]">
                            {d.artifactUrl.replace("https://", "")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedId && selectedDeliverable && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Panel header */}
            <div className="px-6 py-3 border-b border-[#e8e5de] flex items-center justify-between flex-shrink-0 bg-[#faf9f6]">
              <div>
                <h2 className="text-sm font-semibold text-[#1a1a1a]">{selectedDeliverable.title}</h2>
                <div className="text-[11px] text-[#9c9590] mt-0.5">
                  {selectedDeliverable.project?.name} · {formatTime(selectedDeliverable.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedDeliverable.status === "review" && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedDeliverable._id)}
                      disabled={processing === selectedDeliverable._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => openReject(selectedDeliverable._id)}
                      disabled={processing === selectedDeliverable._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </>
                )}
                {selectedDeliverable.status === "approved" && (
                  <button
                    onClick={() => handleDeliver(selectedDeliverable._id)}
                    disabled={processing === selectedDeliverable._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#c2410c] text-white rounded-lg hover:bg-[#a93609] transition-colors disabled:opacity-50 font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Mark Delivered
                  </button>
                )}
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-1.5 text-[#9c9590] hover:text-[#1a1a1a] hover:bg-[#f0ede6] rounded transition-colors text-lg"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Summary */}
              <div>
                <h3 className="text-xs font-semibold text-[#9c9590] uppercase tracking-wider mb-2">Summary</h3>
                <p className="text-sm text-[#1a1a1a] leading-relaxed">{selectedDeliverable.content}</p>
              </div>

              {/* Artifact info */}
              {selectedDeliverable.artifactType && (
                <div className="border border-[#e8e5de] rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#faf9f6] border-b border-[#e8e5de] flex items-center gap-2">
                    {artifactIcons[selectedDeliverable.artifactType]}
                    <span className="text-xs font-semibold text-[#1a1a1a]">
                      {artifactLabels[selectedDeliverable.artifactType] ?? "Artifact"}
                    </span>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* Primary URL */}
                    {selectedDeliverable.artifactUrl && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#9c9590] w-12 flex-shrink-0">URL</span>
                        <a
                          href={selectedDeliverable.artifactUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#c2410c] hover:underline truncate flex-1"
                        >
                          {selectedDeliverable.artifactUrl}
                        </a>
                        <button
                          onClick={() => copyToClipboard(selectedDeliverable.artifactUrl!, "url")}
                          className="p-1 text-[#9c9590] hover:text-[#1a1a1a] transition-colors flex-shrink-0"
                          title="Copy URL"
                        >
                          {copiedField === "url" ? <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}

                    {/* Files */}
                    {selectedDeliverable.artifactFiles && selectedDeliverable.artifactFiles.length > 0 && (
                      <div>
                        <span className="text-xs text-[#9c9590] block mb-1.5">Files</span>
                        <div className="space-y-1">
                          {selectedDeliverable.artifactFiles.map((f: { name: string; url?: string; path?: string; type: string }, i: number) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#faf9f6] rounded border border-[#e8e5de]">
                              <Code2 className="w-3.5 h-3.5 text-[#9c9590] flex-shrink-0" />
                              <span className="text-sm text-[#1a1a1a] flex-1 truncate">{f.name}</span>
                              <span className="text-[10px] text-[#9c9590] bg-[#f5f3ee] px-1.5 py-0.5 rounded">{f.type}</span>
                              {f.url && (
                                <a href={f.url} target="_blank" rel="noopener noreferrer" className="p-1 text-[#c2410c] hover:text-[#a93609]">
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Setup Instructions */}
              {selectedDeliverable.setupInstructions && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-[#9c9590] uppercase tracking-wider">Setup Instructions</h3>
                    <button
                      onClick={() => copyToClipboard(selectedDeliverable.setupInstructions!, "setup")}
                      className="text-[10px] text-[#9c9590] hover:text-[#1a1a1a] flex items-center gap-1 transition-colors"
                    >
                      {copiedField === "setup" ? <ClipboardCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedField === "setup" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="bg-[#1a1a1a] text-[#e8e5de] p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm whitespace-pre-wrap break-words font-mono leading-relaxed">
                      {selectedDeliverable.setupInstructions}
                    </pre>
                  </div>
                </div>
              )}

              {/* Review notes (if rejected before) */}
              {selectedDeliverable.reviewNotes && (
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1">Previous Review Notes</h3>
                  <p className="text-sm text-red-800">{selectedDeliverable.reviewNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal open={showReject} onClose={() => { setShowReject(false); setRejectId(null); }} title="Reject Deliverable" size="sm">
        <div className="p-4 space-y-3">
          <p className="text-xs text-[#9c9590]">
            Provide notes explaining what needs to be changed. The deliverable will be moved back to draft.
          </p>
          <textarea
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            placeholder="What needs to be changed?"
            rows={4}
            className="w-full bg-[#f5f3ee] border border-[#e8e5de] rounded-lg px-3 py-2 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#c2410c] resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowReject(false); setRejectId(null); }}
              className="px-3 py-1.5 text-xs text-[#9c9590] hover:text-[#1a1a1a] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectNotes.trim() || processing !== null}
              className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {processing ? "Rejecting..." : "Reject"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
