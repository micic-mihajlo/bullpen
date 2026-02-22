import { NextRequest, NextResponse } from "next/server";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export async function POST(req: NextRequest) {
  try {
    const { email, needs } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const payload = {
      text: "New Bullpen waitlist signup",
      email,
      needs: typeof needs === "string" ? needs.slice(0, 2000) : "",
      source: "usebullpen.com",
      createdAt: new Date().toISOString(),
    };

    const webhookUrl = process.env.WAITLIST_WEBHOOK_URL;
    if (webhookUrl) {
      const resp = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      if (!resp.ok) {
        return NextResponse.json(
          { error: "Failed to add to waitlist" },
          { status: 502 }
        );
      }

      return NextResponse.json({ success: true, via: "webhook" });
    }

    // Fallback: persist locally if webhook isn't configured yet
    const fallbackPath =
      process.env.WAITLIST_FALLBACK_FILE ||
      "/home/mihbot/deliverables/bullpen/waitlist.jsonl";

    await mkdir(path.dirname(fallbackPath), { recursive: true });
    await appendFile(fallbackPath, `${JSON.stringify(payload)}\n`, "utf8");

    return NextResponse.json({ success: true, via: "file" });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
