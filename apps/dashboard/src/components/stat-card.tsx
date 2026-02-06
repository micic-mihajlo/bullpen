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
      "bg-mc-bg-secondary border border-mc-border rounded overflow-hidden crt-scanlines",
      className
    )}>
      {/* Dark header bar — terminal readout label */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a1a1a]">
        <span className="text-[10px] text-[#888] uppercase tracking-wider font-mono-jb">{label}</span>
        {icon && <span className={cn("opacity-80", accentColors[accent])}>{icon}</span>}
      </div>
      {/* Value readout */}
      <div className="px-3 py-2.5 relative z-10">
        <div className="flex items-baseline gap-2">
          <span className={cn("text-2xl font-mono-jb font-medium", accentColors[accent])}>{value}</span>
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
    </div>
  );
}
