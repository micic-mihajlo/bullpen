import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-10 px-4 diagonal-stripes", className)}>
      {icon && <div className="text-mc-muted mb-3 opacity-30">{icon}</div>}
      <h3 className="text-sm font-display uppercase tracking-wider text-mc-text mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-mc-text-secondary text-center max-w-[280px] mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-xs bg-mc-bull text-white uppercase tracking-wider hover:bg-mc-accent transition-colors font-mono-jb"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
