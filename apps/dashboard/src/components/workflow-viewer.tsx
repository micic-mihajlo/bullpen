"use client";

import { useMemo } from "react";
import {
  Workflow,
  Clock,
  MessageSquare,
  Code2,
  Mail,
  AlertTriangle,
  Zap,
  ArrowRight,
} from "lucide-react";

interface WorkflowNode {
  name: string;
  type: string;
  position: [number, number];
  parameters?: Record<string, unknown>;
}

interface WorkflowData {
  name?: string;
  nodes?: WorkflowNode[];
  connections?: Record<string, unknown>;
}

const nodeIcons: Record<string, React.ReactNode> = {
  "n8n-nodes-base.scheduleTrigger": <Clock className="w-4 h-4" />,
  "n8n-nodes-base.slack": <MessageSquare className="w-4 h-4" />,
  "n8n-nodes-base.code": <Code2 className="w-4 h-4" />,
  "n8n-nodes-base.emailSend": <Mail className="w-4 h-4" />,
  "n8n-nodes-base.errorTrigger": <AlertTriangle className="w-4 h-4" />,
  "n8n-nodes-base.httpRequest": <Zap className="w-4 h-4" />,
  "n8n-nodes-base.webhook": <Zap className="w-4 h-4" />,
};

const nodeColors: Record<string, string> = {
  "n8n-nodes-base.scheduleTrigger": "bg-blue-50 border-blue-200 text-blue-700",
  "n8n-nodes-base.slack": "bg-purple-50 border-purple-200 text-purple-700",
  "n8n-nodes-base.code": "bg-amber-50 border-amber-200 text-amber-700",
  "n8n-nodes-base.emailSend": "bg-emerald-50 border-emerald-200 text-emerald-700",
  "n8n-nodes-base.errorTrigger": "bg-red-50 border-red-200 text-red-700",
  "n8n-nodes-base.httpRequest": "bg-indigo-50 border-indigo-200 text-indigo-700",
  "n8n-nodes-base.webhook": "bg-orange-50 border-orange-200 text-orange-700",
};

function getNodeTypeName(type: string): string {
  const parts = type.split(".");
  const name = parts[parts.length - 1];
  return name
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (s) => s.toUpperCase());
}

interface WorkflowViewerProps {
  content: string;
  className?: string;
}

export function WorkflowViewer({ content, className = "" }: WorkflowViewerProps) {
  const workflow = useMemo<WorkflowData | null>(() => {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }, [content]);

  if (!workflow || !workflow.nodes) {
    return (
      <div className="p-6 text-center text-[#9c9590] text-sm">
        Unable to parse workflow JSON
      </div>
    );
  }

  // Separate main flow from error handling
  const errorNodes = workflow.nodes.filter((n) =>
    n.type.includes("errorTrigger") || n.name.toLowerCase().includes("error")
  );
  const mainNodes = workflow.nodes.filter(
    (n) => !n.type.includes("errorTrigger") && !n.name.toLowerCase().includes("error notification")
  );

  return (
    <div className={`workflow-viewer ${className}`}>
      {/* Workflow name */}
      <div className="flex items-center gap-2 mb-4">
        <Workflow className="w-5 h-5 text-[#c2410c]" />
        <span className="text-lg font-semibold text-[#1a1a1a]">
          {workflow.name || "Untitled Workflow"}
        </span>
        <span className="text-xs text-[#9c9590] bg-[#f5f3ee] px-2 py-0.5 rounded">
          {workflow.nodes.length} nodes
        </span>
      </div>

      {/* Main flow */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-[#9c9590] uppercase tracking-wider mb-2">
          Main Flow
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {mainNodes.map((node, i) => (
            <div key={node.name} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium ${
                  nodeColors[node.type] || "bg-[#faf9f6] border-[#e8e5de] text-[#3a3530]"
                }`}
              >
                {nodeIcons[node.type] || <Zap className="w-4 h-4" />}
                <div>
                  <div className="text-sm font-medium">{node.name}</div>
                  <div className="text-[10px] opacity-70">{getNodeTypeName(node.type)}</div>
                </div>
              </div>
              {i < mainNodes.length - 1 && (
                <ArrowRight className="w-4 h-4 text-[#c2410c] flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error handling */}
      {errorNodes.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-[#9c9590] uppercase tracking-wider mb-2">
            Error Handling
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {workflow.nodes
              .filter((n) => n.type.includes("errorTrigger") || n.name.toLowerCase().includes("error"))
              .map((node, i, arr) => (
                <div key={node.name} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium ${
                      nodeColors[node.type] || "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    {nodeIcons[node.type] || <AlertTriangle className="w-4 h-4" />}
                    <div>
                      <div className="text-sm font-medium">{node.name}</div>
                      <div className="text-[10px] opacity-70">{getNodeTypeName(node.type)}</div>
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Raw JSON toggle */}
      <details className="mt-4">
        <summary className="text-xs text-[#9c9590] cursor-pointer hover:text-[#6b6560] transition-colors">
          View raw JSON
        </summary>
        <pre className="mt-2 bg-[#1a1a1a] text-[#e8e5de] p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto">
          {JSON.stringify(workflow, null, 2)}
        </pre>
      </details>
    </div>
  );
}
