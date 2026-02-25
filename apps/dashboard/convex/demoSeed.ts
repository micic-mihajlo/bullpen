import { mutation } from "./_generated/server";

/**
 * Seed demo data: 1 project with 5 completed tasks + 3 deliverable types.
 * Run after cleanup for a polished demo state.
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Get client
    const clients = await ctx.db.query("clients").collect();
    const client = clients[0];
    if (!client) throw new Error("No client found. Create one first.");

    // Create a completed project
    const projectId = await ctx.db.insert("projects", {
      clientId: client._id,
      name: "SaaS Landing Page",
      type: "code",
      brief: "Build a modern SaaS landing page with hero section, features grid, pricing table with 3 tiers, testimonials, and contact form. Next.js, Tailwind CSS, deploy-ready.",
      status: "delivered",
      createdAt: Date.now() - 3600000, // 1 hour ago
    });

    // Create 5 completed tasks
    const taskDefs = [
      {
        title: "Set up project structure",
        taskType: "coding" as const,
        priority: 1,
        steps: [
          { name: "Scaffold directories", description: "Create folder structure and config files", status: "approved" as const, agentOutput: "Created Next.js 16 project with src/app, src/components (hero, features, testimonials, pricing, contact-form, nav, footer), src/lib, tailwind.config.ts, tsconfig.json strict mode. Build passes." },
          { name: "Install dependencies", description: "Add required packages", status: "approved" as const, agentOutput: "Installed: next@16, react@19, tailwindcss@4, framer-motion@12, lucide-react, react-hook-form@7, zod@3, resend@4, clsx, tailwind-merge, cva. Zero warnings." },
          { name: "Set up CI/CD", description: "Configure build pipeline", status: "approved" as const, agentOutput: "GitHub Actions CI: lint+typecheck+build on PR. Vercel: preview on PR, prod on merge. Husky pre-commit hooks." },
        ],
      },
      {
        title: "Build core pages",
        taskType: "coding" as const,
        priority: 2,
        steps: [
          { name: "Layout & navigation", description: "Build main layout and nav", status: "approved" as const, agentOutput: "Root layout with Inter font, OG metadata. Sticky nav with logo + links + CTA. Mobile hamburger with framer-motion. 4-col footer." },
          { name: "Page components", description: "Build all page sections", status: "approved" as const, agentOutput: "Hero: headline + gradient bg + dual CTAs. Features: 6-card grid with lucide icons. Testimonials: 3-card carousel. Pricing: 3-tier with toggle. Contact: validated form." },
          { name: "Styling & polish", description: "Apply design system", status: "approved" as const, agentOutput: "Design system: slate-900 text, blue-600 primary. Inter typography. Framer-motion scroll animations. Dark mode. Lighthouse: 98/100/100/100." },
        ],
      },
      {
        title: "Build API/backend",
        taskType: "coding" as const,
        priority: 3,
        steps: [
          { name: "Contact form API", description: "Build form submission endpoint", status: "approved" as const, agentOutput: "POST /api/contact: Zod validation, rate limiting (5/hr per IP), Resend email with HTML template. Health check at /api/health." },
          { name: "Security middleware", description: "Add security headers", status: "approved" as const, agentOutput: "X-Frame-Options DENY, CSP, nosniff. Rate limiting on /api/*. CORS configured." },
          { name: "Integration tests", description: "Write API tests", status: "approved" as const, agentOutput: "Vitest: valid submit 200, missing fields 400, bad email 400, rate limit 429, API failure 500, health check 200. 6/6 passing." },
        ],
      },
      {
        title: "Design review",
        taskType: "review" as const,
        priority: 4,
        steps: [
          { name: "Visual audit", description: "Check UI consistency", status: "approved" as const, agentOutput: "Consistent typography, cohesive palette, 8px grid spacing, uniform cards. Minor: testimonial avatars are placeholder divs." },
          { name: "Accessibility review", description: "WCAG compliance", status: "approved" as const, agentOutput: "axe-core: 0 violations. Alt text, form labels, WCAG AA contrast, keyboard nav, skip-to-content, ARIA labels, focus-trapped mobile menu." },
          { name: "Sign-off", description: "Final approval", status: "approved" as const, agentOutput: "All checks passed. Visual ✓ A11y ✓ Responsive ✓ Performance ✓ Dark mode ✓ Cross-browser ✓" },
        ],
      },
      {
        title: "QA testing",
        taskType: "review" as const,
        priority: 5,
        steps: [
          { name: "Functional testing", description: "Test user flows", status: "approved" as const, agentOutput: "Nav scroll, hamburger, pricing toggle, form validation+success+error, rate limiting, external links. 9/9 pass." },
          { name: "Edge case testing", description: "Test error states", status: "approved" as const, agentOutput: "Empty form blocked, XSS sanitized, long input rejected, offline error, 3G <4s, SSR without JS, back/forward scroll. 8/8 pass." },
          { name: "Performance check", description: "Verify metrics", status: "approved" as const, agentOutput: "Lighthouse 98/100/100/100. FCP 0.8s, LCP 1.2s, TBT 50ms, CLS 0.001. Bundle 89KB gzipped. Production ready." },
        ],
      },
    ];

    for (const def of taskDefs) {
      await ctx.db.insert("tasks", {
        title: def.title,
        projectId: projectId,
        taskType: def.taskType,
        priority: def.priority,
        status: "completed",
        steps: def.steps.map((s) => ({
          name: s.name,
          description: s.description,
          status: s.status,
          agentOutput: s.agentOutput,
          completedAt: Date.now() - 1800000,
        })),
        currentStep: def.steps.length - 1,
        createdAt: Date.now() - 3600000,
        completedAt: Date.now() - 1800000,
      });
    }

    // Create 3 deliverables (different types)
    await ctx.db.insert("deliverables", {
      projectId: projectId,
      title: "SaaS Landing Page — Production Ready",
      content: "Complete Next.js 16 landing page with hero, features grid, 3-tier pricing, testimonials carousel, and contact form with email delivery. Tailwind CSS, dark mode, Lighthouse 98/100/100/100. Fully tested, CI/CD configured.",
      format: "repo",
      status: "review",
      artifactType: "repo",
      artifactUrl: "https://github.com/micic-mihajlo/acme-landing",
      artifactFiles: [
        { name: "Live Preview", url: "https://startup-landing.vercel.app", type: "url" },
        { name: "README.md", path: "/home/mihbot/acme-landing/README.md", type: "md" },
      ],
      setupInstructions: "## Setup\n\n```bash\ngit clone https://github.com/micic-mihajlo/acme-landing\ncd acme-landing\nnpm install\nnpm run dev\n```\n\nOpen http://localhost:3000\n\n## Deploy\nPush to any Vercel-connected repo for instant deployment.\n\n## Customize\nEdit app/page.tsx to change content, pricing, and features.",
      createdAt: Date.now() - 900000,
    });

    await ctx.db.insert("deliverables", {
      projectId: projectId,
      title: "Slack-to-Email Digest — n8n Workflow",
      content: "Complete n8n workflow: Schedule Trigger (hourly) → Slack Get Messages → Code node (format digest) → Email Send, plus error handling branch. 6 nodes, ready to import.",
      format: "workflow",
      status: "review",
      artifactType: "workflow",
      artifactFiles: [
        { name: "slack-digest-workflow.json", path: "/home/mihbot/acme-landing/slack-digest-workflow.json", type: "json" },
        { name: "Setup Guide", path: "/home/mihbot/acme-landing/WORKFLOW-README.md", type: "md" },
      ],
      setupInstructions: "1. Open n8n → Workflows → Import from File\n2. Select slack-digest-workflow.json\n3. Configure credentials:\n   - Slack OAuth: create app at api.slack.com\n   - SMTP: your email server settings\n4. Set channel ID + recipient email\n5. Activate the workflow",
      createdAt: Date.now() - 600000,
    });

    await ctx.db.insert("deliverables", {
      projectId: projectId,
      title: "AI Agent Frameworks — Comparison Report",
      content: "492-line research report comparing LangGraph, CrewAI, and Microsoft Agent Framework. Executive summary, 18-row feature comparison matrix, pricing tables, production readiness checklist, architecture diagrams, and recommendations.",
      format: "markdown",
      status: "review",
      artifactType: "document",
      artifactFiles: [
        { name: "agent-research-report.md", path: "/home/mihbot/agent-research-report.md", type: "md" },
      ],
      setupInstructions: "View online or convert to PDF:\n\npandoc agent-research-report.md -o report.pdf",
      createdAt: Date.now() - 300000,
    });

    // Add some activity events
    const eventMsgs = [
      { type: "project_decomposed", message: 'Decomposed "SaaS Landing Page" into 5 tasks', ts: 3500000 },
      { type: "task_dispatched", message: 'Dispatched "Set up project structure" → Frontend Builder', ts: 3400000 },
      { type: "step_auto_reviewed", message: "Step 1 approved: Clean scaffold, all sections covered", ts: 3000000 },
      { type: "task_auto_dispatched", message: 'Auto-dispatched: "Build core pages"', ts: 2800000 },
      { type: "step_auto_reviewed", message: "Step 2 approved: All 5 sections implemented per brief", ts: 2200000 },
      { type: "task_auto_dispatched", message: 'Auto-dispatched: "Build API/backend"', ts: 2000000 },
      { type: "step_auto_reviewed", message: "Step 3 approved: Full test coverage", ts: 1500000 },
      { type: "task_auto_dispatched", message: 'Auto-dispatched: "Design review"', ts: 1400000 },
      { type: "step_auto_reviewed", message: "Accessibility: 0 violations. WCAG AA compliant.", ts: 1000000 },
      { type: "task_auto_dispatched", message: 'Auto-dispatched: "QA testing"', ts: 900000 },
      { type: "project_completed", message: 'All tasks completed for "SaaS Landing Page"', ts: 600000 },
      { type: "deliverable_created", message: "Deliverable ready for review: SaaS Landing Page", ts: 500000 },
    ];

    for (const e of eventMsgs) {
      await ctx.db.insert("events", {
        type: e.type,
        message: e.message,
        timestamp: Date.now() - e.ts,
      });
    }

    return { projectId, tasksCreated: 5, deliverablesCreated: 3, eventsCreated: eventMsgs.length };
  },
});
