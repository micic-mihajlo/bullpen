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
    <div className={cn("flex flex-col items-center justify-center py-10 px-4", className)}>
      {icon && <div className="text-[#9c9590] mb-3 opacity-40">{icon}</div>}
      <h3 className="text-sm font-medium text-[#1a1a1a] mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[#6b6560] text-center max-w-[280px] mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-xs bg-[#c2410c] text-white rounded-lg hover:bg-[#9a3412] transition-colors font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
