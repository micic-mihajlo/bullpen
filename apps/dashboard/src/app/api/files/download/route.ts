import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import * as path from "path";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * GET /api/files/download?deliverableId=xxx
 *
 * Zip all files from a deliverable and return as download.
 * Uses a simple approach: creates a tar.gz via child_process.
 */
export async function GET(request: NextRequest) {
  const deliverableId = request.nextUrl.searchParams.get("deliverableId");

  if (!deliverableId) {
    return NextResponse.json({ error: "deliverableId required" }, { status: 400 });
  }

  try {
    const deliverable = await convex.query(api.deliverables.get, {
      id: deliverableId as Id<"deliverables">,
    });

    if (!deliverable) {
      return NextResponse.json({ error: "Deliverable not found" }, { status: 404 });
    }

    const files = deliverable.artifactFiles || [];
    const localFiles = files.filter(
      (f: { path?: string }) => f.path && f.path.startsWith("/home/mihbot/") && existsSync(f.path)
    );

    if (localFiles.length === 0) {
      return NextResponse.json({ error: "No downloadable files found" }, { status: 404 });
    }

    // For single file, just return it directly
    if (localFiles.length === 1) {
      const f = localFiles[0] as { path: string; name: string; type: string };
      const content = await readFile(f.path);
      const filename = f.name || path.basename(f.path);
      
      return new NextResponse(content, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // For multiple files, create a tar.gz
    const { execSync } = await import("child_process");
    const tmpDir = `/tmp/deliverable-${Date.now()}`;
    const tarFile = `${tmpDir}.tar.gz`;

    execSync(`mkdir -p ${tmpDir}`);

    // Copy files to temp dir
    for (const f of localFiles) {
      const file = f as { path: string; name: string };
      const dest = `${tmpDir}/${file.name || path.basename(file.path)}`;
      execSync(`cp "${file.path}" "${dest}"`);
    }

    // Create tar.gz
    const safeName = deliverable.title.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 50);
    execSync(`tar -czf "${tarFile}" -C "${tmpDir}" .`);

    const tarContent = await readFile(tarFile);

    // Cleanup
    execSync(`rm -rf "${tmpDir}" "${tarFile}"`);

    return new NextResponse(tarContent, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${safeName}.tar.gz"`,
      },
    });
  } catch (err) {
    console.error("[Download] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create download" },
      { status: 500 }
    );
  }
}
