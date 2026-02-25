"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className = "" }: MarkdownViewerProps) {
  return (
    <div className={`markdown-viewer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-[#1a1a1a] mt-8 mb-4 pb-2 border-b border-[#e8e5de]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-[#1a1a1a] mt-6 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-[#1a1a1a] mt-5 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-medium text-[#1a1a1a] mt-4 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-sm text-[#3a3530] leading-relaxed mb-3">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-sm text-[#3a3530] mb-3 space-y-1 ml-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-sm text-[#3a3530] mb-3 space-y-1 ml-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-[#c2410c] pl-4 py-1 my-3 bg-[#faf9f6] rounded-r">
              {children}
            </blockquote>
          ),
          code: ({ className, children }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-[#f5f3ee] text-[#c2410c] px-1.5 py-0.5 rounded text-[13px] font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-[#1a1a1a] text-[#e8e5de] p-4 rounded-lg text-sm font-mono overflow-x-auto whitespace-pre my-3">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="my-3">{children}</pre>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#faf9f6] border-b-2 border-[#e8e5de]">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-semibold text-[#6b6560] uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-sm text-[#3a3530] border-b border-[#f0ede6]">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-[#faf9f6] transition-colors">{children}</tr>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c2410c] hover:underline"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-6 border-[#e8e5de]" />,
          strong: ({ children }) => (
            <strong className="font-semibold text-[#1a1a1a]">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-[#6b6560]">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
