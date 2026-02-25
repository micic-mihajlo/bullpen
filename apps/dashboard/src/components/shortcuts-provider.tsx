"use client";

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from "react";

type ShortcutAction = "newTask" | "newAgent" | "newProject" | "refresh" | "help";

interface ShortcutsContextValue {
  registerAction: (action: ShortcutAction, handler: () => void) => () => void;
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

const ShortcutsContext = createContext<ShortcutsContextValue | null>(null);

export function useShortcuts() {
  const ctx = useContext(ShortcutsContext);
  if (!ctx) throw new Error("useShortcuts must be used within ShortcutsProvider");
  return ctx;
}

export function useRegisterShortcut(action: ShortcutAction, handler: () => void) {
  const { registerAction } = useShortcuts();

  useEffect(() => {
    return registerAction(action, handler);
  }, [registerAction, action, handler]);
}

export function ShortcutsProvider({ children }: { children: ReactNode }) {
  const [handlers, setHandlers] = useState<Map<ShortcutAction, () => void>>(new Map());
  const [showHelp, setShowHelp] = useState(false);

  const registerAction = useCallback((action: ShortcutAction, handler: () => void) => {
    setHandlers((prev) => {
      const next = new Map(prev);
      next.set(action, handler);
      return next;
    });

    return () => {
      setHandlers((prev) => {
        const next = new Map(prev);
        next.delete(action);
        return next;
      });
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement;

      if (isInput && e.key !== "Escape") return;

      switch (e.key.toLowerCase()) {
        case "n":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handlers.get("newTask")?.();
          }
          break;
        case "a":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handlers.get("newAgent")?.();
          }
          break;
        case "p":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handlers.get("newProject")?.();
          }
          break;
        case "r":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handlers.get("refresh")?.();
          }
          break;
        case "?":
          e.preventDefault();
          setShowHelp((prev) => !prev);
          break;
        case "escape":
          setShowHelp(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);

  return (
    <ShortcutsContext.Provider value={{ registerAction, showHelp, setShowHelp }}>
      {children}
      {showHelp && <ShortcutsHelp onClose={() => setShowHelp(false)} />}
    </ShortcutsContext.Provider>
  );
}

const shortcuts = [
  { label: "New task", key: "N" },
  { label: "New project", key: "P" },
  { label: "New agent", key: "A" },
  { label: "Refresh", key: "R" },
  { label: "Show help", key: "?" },
  { label: "Close", key: "Esc" },
  { separator: true, label: "Navigation" },
  { label: "Command Center", key: "1" },
  { label: "Projects", key: "2" },
  { label: "Agents", key: "3" },
];

function ShortcutsHelp({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-mc-bg-secondary border border-mc-border rounded-lg w-full max-w-xs animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-mc-border">
          <span className="text-sm font-medium">Keyboard Shortcuts</span>
        </div>
        <div className="p-3 space-y-2 text-sm">
          {shortcuts.map((s, i) => (
            "separator" in s ? (
              <div key={i} className="text-xs text-mc-text-secondary uppercase tracking-wide pt-2 pb-1 border-t border-mc-border mt-2">
                {s.label}
              </div>
            ) : (
              <div key={i} className="flex justify-between">
                <span className="text-mc-text-secondary">{s.label}</span>
                <kbd className="px-1.5 py-0.5 bg-mc-bg rounded text-xs font-mono">{s.key}</kbd>
              </div>
            )
          ))}
        </div>
        <div className="p-2 border-t border-mc-border text-center">
          <span className="text-xs text-mc-text-secondary">Press Esc to close</span>
        </div>
      </div>
    </div>
  );
}
