"use client";

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from "react";

type ShortcutAction = "newTask" | "newAgent" | "refresh" | "help";

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

// Hook for components to register their shortcut handlers
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
      // Ignore if typing in inputs (except escape)
      const isInput = 
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement;

      if (isInput && e.key !== "Escape") return;

      // Handle shortcuts
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

function ShortcutsHelp({ onClose }: { onClose: () => void }) {
  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-mc-bg-secondary border border-mc-border rounded-lg w-full max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-mc-border">
          <span className="text-sm font-medium">Keyboard Shortcuts</span>
        </div>
        <div className="p-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-mc-text-secondary">New task</span>
            <kbd className="px-1.5 py-0.5 bg-mc-bg rounded text-xs font-mono">N</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-mc-text-secondary">New agent</span>
            <kbd className="px-1.5 py-0.5 bg-mc-bg rounded text-xs font-mono">A</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-mc-text-secondary">Refresh</span>
            <kbd className="px-1.5 py-0.5 bg-mc-bg rounded text-xs font-mono">R</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-mc-text-secondary">Show help</span>
            <kbd className="px-1.5 py-0.5 bg-mc-bg rounded text-xs font-mono">?</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-mc-text-secondary">Close</span>
            <kbd className="px-1.5 py-0.5 bg-mc-bg rounded text-xs font-mono">Esc</kbd>
          </div>
        </div>
        <div className="p-2 border-t border-mc-border text-center">
          <span className="text-xs text-mc-text-secondary">Press any key to close</span>
        </div>
      </div>
    </div>
  );
}
