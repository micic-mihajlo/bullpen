import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type StepDef = { name: string; description: string; status: "pending" };
type TaskDef = {
  title: string;
  taskType: "coding" | "automation" | "research" | "review" | "general";
  steps: StepDef[];
};

function getTasksForType(projectType: string): TaskDef[] {
  const s = (name: string, description: string): StepDef => ({
    name,
    description,
    status: "pending",
  });

  switch (projectType) {
    case "code":
      return [
        {
          title: "Set up project structure",
          taskType: "coding",
          steps: [
            s("Scaffold directories", "Create folder structure and config files"),
            s("Install dependencies", "Add required packages and configure tooling"),
            s("Set up CI/CD", "Configure build pipeline and deployment"),
          ],
        },
        {
          title: "Build core pages",
          taskType: "coding",
          steps: [
            s("Layout & navigation", "Build main layout and nav components"),
            s("Page templates", "Create page shells with routing"),
            s("Data fetching", "Wire up data loading and state management"),
            s("Styling & polish", "Apply design system and responsive styles"),
          ],
        },
        {
          title: "Build API/backend",
          taskType: "coding",
          steps: [
            s("Schema & models", "Define data schema and validation"),
            s("CRUD endpoints", "Build create/read/update/delete operations"),
            s("Auth & middleware", "Add authentication and request middleware"),
            s("Integration tests", "Write and run API integration tests"),
          ],
        },
        {
          title: "Design review",
          taskType: "review",
          steps: [
            s("Visual audit", "Check UI against design specs"),
            s("Accessibility review", "Verify a11y compliance"),
            s("Sign-off", "Final design approval"),
          ],
        },
        {
          title: "QA testing",
          taskType: "review",
          steps: [
            s("Functional testing", "Test all user flows end-to-end"),
            s("Edge case testing", "Test error states and edge cases"),
            s("Performance check", "Verify load times and bundle size"),
          ],
        },
      ];

    case "automation":
      return [
        {
          title: "Design workflow architecture",
          taskType: "automation",
          steps: [
            s("Map triggers & inputs", "Identify all trigger conditions and data inputs"),
            s("Define processing steps", "Outline transformation and logic nodes"),
            s("Plan error handling", "Design retry, fallback, and alerting strategy"),
          ],
        },
        {
          title: "Build and test workflow",
          taskType: "automation",
          steps: [
            s("Implement triggers", "Build trigger listeners and input parsing"),
            s("Build processing pipeline", "Implement data transformation nodes"),
            s("Connect outputs", "Wire up destinations and notifications"),
            s("End-to-end test", "Run full pipeline with test data"),
          ],
        },
        {
          title: "QA and monitoring",
          taskType: "review",
          steps: [
            s("Stress test", "Test under load and concurrent triggers"),
            s("Set up monitoring", "Add logging, metrics, and alerts"),
            s("Documentation", "Write runbook and operational docs"),
          ],
        },
      ];

    case "research":
      return [
        {
          title: "Initial research sweep",
          taskType: "research",
          steps: [
            s("Define research questions", "Clarify scope and key questions"),
            s("Source identification", "Find relevant sources and datasets"),
            s("Initial scan", "Skim sources and tag key findings"),
            s("Gap analysis", "Identify missing info and follow-up areas"),
          ],
        },
        {
          title: "Deep dive analysis",
          taskType: "research",
          steps: [
            s("Detailed review", "In-depth analysis of top sources"),
            s("Cross-reference", "Compare findings across sources"),
            s("Synthesize insights", "Extract key themes and conclusions"),
          ],
        },
        {
          title: "Compile report",
          taskType: "general",
          steps: [
            s("Draft report", "Write initial report with findings"),
            s("Add visuals", "Create charts, tables, and diagrams"),
            s("Final review", "Proofread and polish deliverable"),
          ],
        },
      ];

    default:
      return [
        {
          title: "Planning",
          taskType: "general",
          steps: [
            s("Define scope", "Clarify requirements and success criteria"),
            s("Create timeline", "Break work into phases with milestones"),
            s("Resource allocation", "Assign team and tools needed"),
          ],
        },
        {
          title: "Execution",
          taskType: "general",
          steps: [
            s("Phase 1 work", "Complete first phase deliverables"),
            s("Phase 2 work", "Complete second phase deliverables"),
            s("Integration", "Combine outputs and verify coherence"),
            s("Polish", "Final refinements and cleanup"),
          ],
        },
        {
          title: "Review",
          taskType: "review",
          steps: [
            s("Internal review", "Team review of all deliverables"),
            s("Revisions", "Address feedback and make corrections"),
            s("Final sign-off", "Approve for delivery"),
          ],
        },
      ];
  }
}

/**
 * POST /api/projects/[id]/decompose
 *
 * Decomposes a project into tasks with steps based on project type.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // 1. Read the project
    const project = await convex.query(api.projects.get, {
      id: projectId as Id<"projects">,
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 2. Get task definitions based on project type
    const taskDefs = getTasksForType(project.type);

    // 3. Create each task in Convex
    const taskIds: string[] = [];
    for (const def of taskDefs) {
      const taskId = await convex.mutation(api.tasks.create, {
        title: def.title,
        projectId: projectId as Id<"projects">,
        taskType: def.taskType,
        steps: def.steps,
      });
      taskIds.push(taskId);
    }

    // 4. Log event
    await convex.mutation(api.events.create, {
      type: "project_decomposed",
      message: `Decomposed "${project.name}" into ${taskIds.length} tasks`,
      data: { projectId, taskCount: taskIds.length },
    });

    return NextResponse.json({ success: true, taskIds });
  } catch (error) {
    console.error("[Decompose] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
