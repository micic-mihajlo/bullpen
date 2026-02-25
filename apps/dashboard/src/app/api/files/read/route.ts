import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

/**
 * GET /api/files/read?path=/home/mihbot/...
 * 
 * Read a file from the server filesystem and return its contents.
 * Only allows files under /home/mihbot/ for security.
 */
export async function GET(request: NextRequest) {
  const filePath = request.nextUrl.searchParams.get("path");
  
  if (!filePath) {
    return NextResponse.json({ error: "path parameter required" }, { status: 400 });
  }

  // Security: only allow files under /home/mihbot/
  if (!filePath.startsWith("/home/mihbot/")) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  try {
    const content = await readFile(filePath, "utf-8");
    const ext = filePath.split(".").pop()?.toLowerCase() || "";
    
    return NextResponse.json({
      content,
      path: filePath,
      name: filePath.split("/").pop(),
      extension: ext,
      size: content.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to read file" },
      { status: 500 }
    );
  }
}
