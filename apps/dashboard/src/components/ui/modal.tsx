"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Modal({ open, onClose, title, children, className, size = "sm" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
  }[size];

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-mc-bg-secondary border border-mc-border rounded-lg w-full shadow-lg animate-slide-in overflow-hidden",
          sizeClass,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="terminal-header">
            <span className="terminal-header-text text-sm font-medium">{title}</span>
            <button
              onClick={onClose}
              className="ml-auto p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-[#666]" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
