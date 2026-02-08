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
  blue: "text-[#c2410c]",
  green: "text-mc-accent-green",
  yellow: "text-mc-accent-yellow",
  red: "text-mc-accent-red",
  purple: "text-mc-accent-purple",
};

export function StatCard({ label, value, icon, trend, accent = "blue", className }: StatCardProps) {
  return (
    <div className={cn(
      "bg-white border border-[#e8e5de] rounded-lg p-4 hover:shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-shadow",
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] text-[#9c9590] font-medium">{label}</span>
        {icon && <span className={cn("opacity-60", accentColors[accent])}>{icon}</span>}
      </div>
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
  );
}
