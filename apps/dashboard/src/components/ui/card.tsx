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
        "rounded-lg border border-[#e8e5de] bg-white",
        "transition-all duration-150",
        hover && "hover:border-[#c2410c]/20 hover:shadow-[0_1px_3px_rgba(0,0,0,0.04)] cursor-pointer",
        glow === "cyan" && "border-cyan-600/15",
        glow === "green" && "border-green-600/15",
        glow === "amber" && "border-amber-600/15",
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
        "px-5 py-4 border-b border-[#f0ede6]",
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
    <h3 className={cn("text-sm font-semibold text-[#1a1a1a]", className)}>
      {children}
    </h3>
  );
}
