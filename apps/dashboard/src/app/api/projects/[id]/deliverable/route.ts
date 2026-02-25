import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * POST /api/projects/[id]/deliverable
 *
 * Create a deliverable for a project. Called by the orchestrator when all tasks are done.
 *
 * Body: {
 *   title: string,
 *   content: string,          // summary for display
 *   artifactType: "repo" | "workflow" | "document" | "files" | "preview",
 *   artifactUrl?: string,     // primary URL (repo link, preview URL, etc.)
 *   artifactFiles?: Array<{ name, path?, url?, type }>,
 *   setupInstructions?: string,
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const {
      title,
      content,
      artifactType,
      artifactUrl,
      artifactFiles,
      setupInstructions,
    } = body;

    if (!title || !content || !artifactType) {
      return NextResponse.json(
        { error: "title, content, and artifactType are required" },
        { status: 400 }
      );
    }

    // Validate project exists
    const project = await convex.query(api.projects.get, {
      id: projectId as Id<"projects">,
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Determine format from artifactType
    const formatMap: Record<string, string> = {
      repo: "repo",
      workflow: "workflow",
      document: "markdown",
      files: "files",
      preview: "preview",
    };

    const deliverableId = await convex.mutation(api.deliverables.create, {
      projectId: projectId as Id<"projects">,
      title,
      content,
      format: formatMap[artifactType] || "markdown",
      artifactType: artifactType as "repo" | "workflow" | "document" | "files" | "preview",
      artifactUrl,
      artifactFiles,
      setupInstructions,
    });

    // Auto-submit for human review
    await convex.mutation(api.deliverables.submitForReview, {
      id: deliverableId as Id<"deliverables">,
    });

    return NextResponse.json({
      success: true,
      deliverableId,
    });
  } catch (error) {
    console.error("[Deliverable] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
