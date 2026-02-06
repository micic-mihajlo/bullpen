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
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      {icon && <div className="text-mc-text-secondary mb-3 opacity-50">{icon}</div>}
      <h3 className="text-sm font-medium text-mc-text mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-mc-text-secondary text-center max-w-[280px] mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-3 py-1.5 text-xs bg-mc-accent text-white rounded hover:bg-mc-accent/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
