"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Bot,
  CheckSquare,
  FileCheck2,
  Users,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  shortcut?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // Fetch counts for badges
  const tasks = useQuery(api.tasks.list);
  const pendingReview = useQuery(api.deliverables.pendingReview);

  const runningTasks = tasks?.filter((t) => t.status === "running").length ?? 0;
  const reviewCount = pendingReview?.length ?? 0;

  const navItems: NavItem[] = [
    { label: "Overview", href: "/", icon: <LayoutDashboard className="w-4 h-4" />, shortcut: "1" },
    { label: "Projects", href: "/projects", icon: <FolderKanban className="w-4 h-4" />, shortcut: "2" },
    { label: "Agents", href: "/agents", icon: <Bot className="w-4 h-4" />, shortcut: "3" },
    { label: "Tasks", href: "/tasks", icon: <CheckSquare className="w-4 h-4" />, badge: runningTasks || undefined, shortcut: "4" },
    { label: "Review", href: "/review", icon: <FileCheck2 className="w-4 h-4" />, badge: reviewCount || undefined, shortcut: "5" },
    { label: "Clients", href: "/clients", icon: <Users className="w-4 h-4" />, shortcut: "6" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Keyboard navigation (1-6)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement;
      if (isInput) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const num = parseInt(e.key);
      if (num >= 1 && num <= navItems.length) {
        e.preventDefault();
        router.push(navItems[num - 1].href);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, navItems]);

  return (
    <aside
      className={cn(
        "h-full flex flex-col bg-mc-bg-secondary border-r border-mc-border transition-all duration-200 flex-shrink-0",
        collapsed ? "w-14" : "w-52"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-2 px-3 py-3 border-b border-mc-border",
        collapsed && "justify-center"
      )}>
        <span className="text-lg flex-shrink-0">🐂</span>
        {!collapsed && (
          <span className="font-semibold text-sm tracking-tight truncate">bullpen</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors relative",
                active
                  ? "bg-mc-accent/10 text-mc-accent"
                  : "text-mc-text-secondary hover:text-mc-text hover:bg-mc-bg-tertiary",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? `${item.label} (${item.shortcut})` : undefined}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-mc-accent rounded-r" />
              )}
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto text-xs bg-mc-accent/20 text-mc-accent px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-mc-accent rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-mc-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-mc-text-secondary hover:text-mc-text hover:bg-mc-bg-tertiary transition-colors",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
