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
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-mc-bg-secondary border border-mc-border rounded-lg w-full animate-slide-in",
          sizeClass,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="p-3 border-b border-mc-border flex items-center justify-between">
            <span className="text-sm font-medium">{title}</span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-mc-bg-tertiary rounded transition-colors"
            >
              <X className="w-4 h-4 text-mc-text-secondary" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
