import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: { value: string; positive?: boolean };
  accent?: "blue" | "green" | "yellow" | "red" | "purple";
  className?: string;
}

const accentColors = {
  blue: "text-mc-accent",
  green: "text-mc-accent-green",
  yellow: "text-mc-accent-yellow",
  red: "text-mc-accent-red",
  purple: "text-mc-accent-purple",
};

export function StatCard({ label, value, icon, trend, accent = "blue", className }: StatCardProps) {
  return (
    <div className={cn(
      "p-4 bg-mc-bg-secondary border border-mc-border rounded-lg relative overflow-hidden crt-scanlines",
      className
    )}>
      <div className="flex items-center justify-between mb-2 relative z-10">
        <span className="text-xs text-mc-text-secondary uppercase tracking-wide font-body">{label}</span>
        {icon && <span className={cn("opacity-60", accentColors[accent])}>{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2 relative z-10">
        <span className={cn("text-2xl font-display tracking-wide", accentColors[accent])}>{value}</span>
        {trend && (
          <span className={cn(
            "text-xs font-mono-jb",
            trend.positive ? "text-mc-accent-green" : "text-mc-accent-red"
          )}>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
