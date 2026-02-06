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
        "rounded-lg border border-mc-border bg-mc-bg-secondary",
        "transition-all duration-200",
        hover && "hover:border-mc-accent/30 hover:shadow-sm cursor-pointer",
        glow === "cyan" && "border-cyan-600/20 shadow-[0_0_20px_-5px_rgba(8,145,178,0.1)]",
        glow === "green" && "border-green-600/20 shadow-[0_0_20px_-5px_rgba(22,163,74,0.1)]",
        glow === "amber" && "border-amber-600/20 shadow-[0_0_20px_-5px_rgba(202,138,4,0.1)]",
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
        "px-5 py-4 border-b border-mc-border",
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
    <h3 className={cn("text-sm font-semibold text-mc-text", className)}>
      {children}
    </h3>
  );
}
