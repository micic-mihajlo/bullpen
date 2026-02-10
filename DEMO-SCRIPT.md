# Bullpen Demo Recording Script

**Target: under 3 minutes**
**URL:** https://ubuntu-8gb-nbg1-1.tail706c84.ts.net:8443

---

## Scene 1: Command Center (0:00 - 0:20)

**Show:** Empty command center — clean slate, 6 worker templates visible in idle mode.

**Narration:** "When a client submits their project requirements, they appear here in the command center. This is the orchestrator's view — where the AI breaks down the project into actionable tasks and kicks off specialized agents to work on them."

**Action:** Click "Projects" in sidebar.

---

## Scene 2: Create Project (0:20 - 0:40)

**Show:** Projects page — empty.

**Action:** Click "New Project" button. Fill in:
- **Client:** Acme Corp
- **Name:** SaaS Landing Page
- **Type:** code
- **Brief:** "Build a modern SaaS landing page with hero section, features grid, pricing table with 3 tiers, testimonials, and contact form. Next.js, Tailwind CSS, deploy-ready."

Hit "Create" → then hit "Decompose" on the project card.

**Narration:** "The orchestrator automatically decomposes this into typed tasks — coding, review, QA — each with step-by-step execution plans."

---

## Scene 3: Tasks Breakdown (0:40 - 1:00)

**Show:** The 5 tasks appear on the command center:
1. Set up project structure (coding)
2. Build core pages (coding)
3. Build API/backend (coding)
4. Design review (review)
5. QA testing (review)

**Narration:** "Each task type gets assigned to a specialized worker. Frontend builders handle the UI, backend engineers do APIs, design reviewers check accessibility, QA testers verify everything works. These aren't chatbots — they're full AI agents with file system access, web search, and code editors."

**Action:** Click on task 1 to show the steps: Scaffold directories → Install dependencies → Set up CI/CD.

---

## Scene 4: Workers Page (1:00 - 1:15)

**Action:** Click "Workers" in sidebar.

**Show:** 6 worker templates — Frontend Builder, Backend Engineer, Automation Builder, Research Analyst, Design Reviewer, QA Tester. Each with model info and skills.

**Narration:** "Six specialized worker types, each with their own skills and model. Coding workers run on Sonnet 4.5, research and design review on Opus — matching the right model to the task complexity."

---

## Scene 5: Work in Progress (1:15 - 1:45)

**[SPLIT SCREEN in edit — show 3 tasks working simultaneously]**

Go back to Command Center. Tasks should be running (dispatch happened on decompose).

**Show:** Workers actively progressing through steps — step bars filling up, status changing from "in progress" to "review" to "approved".

**Narration:** "Each worker executes its steps and reports back. The orchestrator reviews every step — checking completeness, quality, consistency. If something's not right, it rejects with specific feedback. No rubber-stamping."

**[SPEED UP this section in edit]**

---

## Scene 6: Completed + Deliverables (1:45 - 2:30)

**Action:** Click "Deliverables" in sidebar.

**Show:** The deliverable appears — "SaaS Landing Page — Production Ready" with:
- Artifact type: Repository
- GitHub URL (clickable)
- Files: Live preview, README
- Setup instructions in dark code block
- Inline markdown viewer showing the report content
- Download button

**Narration:** "When all tasks complete, the deliverable is compiled — not a summary of what agents did, but the actual artifact. For code projects, that's a GitHub repo the client can clone and deploy. For automation, it's an importable n8n workflow. For research, a full report with sources."

**Action:** Click through different deliverable types to show:
1. The code repo deliverable (GitHub link)
2. A workflow deliverable (n8n node visualization)
3. A research deliverable (inline markdown with tables)

**Narration:** "The client gets exactly what they need — clone the repo, import the workflow, read the report. Approve, request changes, or ship it."

**Action:** Click "Approve" on a deliverable.

---

## Scene 7: Closing (2:30 - 2:50)

**Show:** Back to command center — all tasks done, project complete.

**Narration:** "What used to take a team of developers weeks, our agents deliver in minutes. Real code, real workflows, real deliverables — reviewed at every step."

---

## Pre-recording Prep

Before recording, make sure:
1. Dashboard is on production mode (pnpm start, not dev)
2. All old data is cleaned (run cleanup:clearAll)
3. Worker templates are seeded (6 templates)
4. One client exists: Acme Corp
5. No projects yet — create fresh during recording
6. Have the demo deliverables ready to show (from previous test runs)

### Quick seed command for deliverable showcase:
```bash
# After the main project demo, seed the other deliverable types for Scene 6:
curl -s -X POST http://localhost:3001/api/projects/PROJECT_ID/deliverable \
  -H "Content-Type: application/json" \
  -d '{"title":"n8n Slack Digest Workflow","content":"6-node workflow: Schedule→Slack→Format→Email with error handling","artifactType":"workflow","artifactFiles":[{"name":"slack-digest-workflow.json","path":"/home/mihbot/acme-landing/slack-digest-workflow.json","type":"json"},{"name":"Setup Guide","path":"/home/mihbot/acme-landing/WORKFLOW-README.md","type":"md"}],"setupInstructions":"Import via n8n UI → Configure Slack OAuth + SMTP credentials"}'

curl -s -X POST http://localhost:3001/api/projects/PROJECT_ID/deliverable \
  -H "Content-Type: application/json" \
  -d '{"title":"AI Agent Frameworks Report","content":"492-line comparison: LangGraph vs CrewAI vs MS Agent Framework","artifactType":"document","artifactFiles":[{"name":"agent-research-report.md","path":"/home/mihbot/agent-research-report.md","type":"md"}],"setupInstructions":"Standalone markdown. Convert to PDF: pandoc report.md -o report.pdf"}'
```
