import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "cyan" | "green" | "amber" | "none";
}

export function Card({ children, className, hover = false, glow = "none" }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm",
        "transition-all duration-200",
        hover && "hover:border-zinc-700/50 hover:bg-zinc-900/80 cursor-pointer",
        glow === "cyan" && "border-cyan-500/20 shadow-[0_0_30px_-5px_rgba(34,211,238,0.15)]",
        glow === "green" && "border-emerald-500/20 shadow-[0_0_30px_-5px_rgba(74,222,128,0.15)]",
        glow === "amber" && "border-amber-500/20 shadow-[0_0_30px_-5px_rgba(251,191,36,0.15)]",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "px-5 py-4 border-b border-zinc-800/50",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn("text-sm font-semibold text-zinc-100", className)}>
      {children}
    </h3>
  );
}
