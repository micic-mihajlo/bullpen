"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onNewTask?: () => void;
  onNewAgent?: () => void;
  onRefresh?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        // Still handle Escape in inputs
        if (e.key === "Escape" && handlers.onEscape) {
          handlers.onEscape();
        }
        return;
      }

      // Global shortcuts
      switch (e.key.toLowerCase()) {
        case "n":
          if (!e.ctrlKey && !e.metaKey && handlers.onNewTask) {
            e.preventDefault();
            handlers.onNewTask();
          }
          break;
        case "a":
          if (!e.ctrlKey && !e.metaKey && handlers.onNewAgent) {
            e.preventDefault();
            handlers.onNewAgent();
          }
          break;
        case "r":
          if (!e.ctrlKey && !e.metaKey && handlers.onRefresh) {
            e.preventDefault();
            handlers.onRefresh();
          }
          break;
        case "escape":
          if (handlers.onEscape) {
            handlers.onEscape();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
