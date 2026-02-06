"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
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
  Image,
  Link,
} from "lucide-react";

const formatIcons: Record<string, React.ReactNode> = {
  markdown: <FileText className="w-4 h-4" />,
  code: <Code2 className="w-4 h-4" />,
  figma: <Image className="w-4 h-4" />,
  url: <Link className="w-4 h-4" />,
  pdf: <FileText className="w-4 h-4" />,
};

export default function ReviewPage() {
  const pendingReview = useQuery(api.deliverables.pendingReview);
  const approveDeliverable = useMutation(api.deliverables.approve);
  const rejectDeliverable = useMutation(api.deliverables.reject);
  const { addToast } = useToast();

  const [selectedId, setSelectedId] = useState<Id<"deliverables"> | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectId, setRejectId] = useState<Id<"deliverables"> | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const selectedDeliverable = pendingReview?.find((d) => d._id === selectedId);

  const handleApprove = async (id: Id<"deliverables">) => {
    setProcessing(id);
    try {
      await approveDeliverable({ id, reviewedBy: "operator" });
      addToast("Deliverable approved", "success");
      if (selectedId === id) setSelectedId(null);
    } catch {
      addToast("Failed to approve", "error");
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
      <header className="flex-shrink-0 border-b border-mc-border bg-mc-bg-secondary/80 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl tracking-wide text-mc-text uppercase">Review Queue</h1>
            <p className="text-xs text-mc-text-secondary font-mono-jb">
              {pendingReview?.length ?? 0} deliverables awaiting review
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* List */}
        <div className={cn(
          "flex-shrink-0 border-r border-mc-border overflow-y-auto",
          selectedId ? "w-80" : "w-full max-w-2xl mx-auto"
        )}>
          {!pendingReview ? (
            <div className="p-4">
              <SkeletonList count={5} />
            </div>
          ) : pendingReview.length === 0 ? (
            <EmptyState
              icon={<FileCheck2 className="w-10 h-10" />}
              title="Review queue is clear"
              description="All deliverables have been reviewed. Nice work!"
              className="h-full"
            />
          ) : (
            <div className="divide-y divide-mc-border">
              {pendingReview.map((d) => (
                <div
                  key={d._id}
                  className={cn(
                    "px-4 py-3 cursor-pointer transition-colors",
                    selectedId === d._id
                      ? "bg-mc-accent/10 border-l-2 border-l-mc-accent"
                      : "hover:bg-mc-bg-tertiary/50"
                  )}
                >
                  <div onClick={() => setSelectedId(d._id)} className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex-shrink-0 text-mc-text-secondary">
                        {formatIcons[d.format] || <FileText className="w-4 h-4" />}
                      </span>
                      <span className="text-sm font-medium truncate text-mc-text">{d.title}</span>
                    </div>
                    <div className="text-xs text-mc-text-secondary">
                      {d.project?.name ?? "Unknown project"}
                      {d.client && ` · ${d.client.name}`}
                    </div>
                    <div className="text-xs text-mc-muted mt-1 font-mono-jb">
                      {formatTime(d.createdAt)}
                      <span className="mx-1">·</span>
                      {d.format}
                    </div>
                  </div>
                  {/* Actions */}
                  {!selectedId && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setSelectedId(d._id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-mc-text-secondary hover:text-mc-text hover:bg-mc-bg-tertiary rounded transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleApprove(d._id)}
                        disabled={processing === d._id}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-mc-accent-green hover:bg-mc-accent-green/10 rounded transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Approve
                      </button>
                      <button
                        onClick={() => openReject(d._id)}
                        disabled={processing === d._id}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-mc-accent-red hover:bg-mc-accent-red/10 rounded transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview panel */}
        {selectedId && selectedDeliverable && (
          <div className="flex-1 flex flex-col overflow-hidden animate-slide-in-left">
            <div className="px-6 py-3 border-b border-mc-border flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-sm font-medium text-mc-text">{selectedDeliverable.title}</h2>
                <div className="text-xs text-mc-text-secondary font-mono-jb">
                  {selectedDeliverable.project?.name} · {selectedDeliverable.format}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApprove(selectedDeliverable._id)}
                  disabled={processing === selectedDeliverable._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-mc-accent-green/12 text-mc-accent-green rounded hover:bg-mc-accent-green/20 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve
                </button>
                <button
                  onClick={() => openReject(selectedDeliverable._id)}
                  disabled={processing === selectedDeliverable._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-mc-accent-red/12 text-mc-accent-red rounded hover:bg-mc-accent-red/20 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-1.5 text-mc-text-secondary hover:text-mc-text hover:bg-mc-bg-tertiary rounded transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose-warm max-w-none">
                {selectedDeliverable.format === "code" ? (
                  <pre className="p-4 bg-mc-bg-tertiary rounded-lg border border-mc-border text-sm overflow-x-auto whitespace-pre-wrap break-words font-mono-jb text-mc-text">
                    {selectedDeliverable.content}
                  </pre>
                ) : (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-mc-text">
                    {selectedDeliverable.content}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal open={showReject} onClose={() => { setShowReject(false); setRejectId(null); }} title="Reject Deliverable" size="sm">
        <div className="p-4 space-y-3">
          <p className="text-xs text-mc-text-secondary">
            Provide notes explaining what needs to be changed. The deliverable will be moved back to draft.
          </p>
          <textarea
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            placeholder="What needs to be changed?"
            rows={4}
            className="w-full bg-mc-bg border border-mc-border rounded px-3 py-2 text-sm text-mc-text focus:outline-none focus:border-mc-accent resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowReject(false); setRejectId(null); }}
              className="px-3 py-1.5 text-xs text-mc-text-secondary hover:text-mc-text transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectNotes.trim() || processing !== null}
              className="px-3 py-1.5 text-xs bg-mc-accent-red text-white rounded hover:bg-mc-accent-red/90 disabled:opacity-50 transition-colors"
            >
              {processing ? "Rejecting..." : "Reject"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
