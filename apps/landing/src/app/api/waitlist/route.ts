import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

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

    // Fallback: Vercel Blob (serverless-safe)
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken) {
      const key = `waitlist/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${email.replace(/[^a-zA-Z0-9@._-]/g, "_")}.json`;
      await put(key, JSON.stringify(payload, null, 2), {
        access: "private",
        contentType: "application/json",
        token: blobToken,
        addRandomSuffix: false,
      });

      return NextResponse.json({ success: true, via: "blob" });
    }

    // Last-resort fallback: capture in function logs so signups are not lost during demos.
    console.info("WAITLIST_FALLBACK", JSON.stringify(payload));
    return NextResponse.json({ success: true, via: "logs" });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
