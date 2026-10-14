
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const ADMIN_EMAIL = "admin@bestsalesgh.com";
const COOKIE_NAME = "bsg_admin_session";

const ALLOWED_SLUGS = new Set([
  "about",
  "contact",
  "privacy-policy",
  "terms",
  "home",
]);

function isAdminAuthenticated(request: NextRequest): boolean {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET;
    const session = request.cookies.get(COOKIE_NAME)?.value;

    if (!secret || !session) return false;

    const parts = session.split(".");
    if (parts.length !== 2) return false;

    const [payload, signature] = parts;

    const expected = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      return false;
    }

    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    return (
      decoded.email === ADMIN_EMAIL &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("CMS server environment is not configured.");
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Administrator authentication required." },
    { status: 401 }
  );
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) return unauthorized();

  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("cms_pages")
      .select("id, slug, title, content, published, updated_at")
      .order("slug");

    if (error) throw error;

    return NextResponse.json({ success: true, pages: data });
  } catch (error) {
    console.error("CMS LOAD ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load CMS pages." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) return unauthorized();

  try {
    const body = await request.json();

    const slug = typeof body.slug === "string" ? body.slug : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content : "";
    const published = body.published;

    if (
      !ALLOWED_SLUGS.has(slug) ||
      !title ||
      title.length > 150 ||
      content.length > 30000 ||
      typeof published !== "boolean"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid page details." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("cms_pages")
      .upsert(
        {
          slug,
          title,
          content,
          published,
          updated_at: new Date().toISOString(),
          updated_by: null,
        },
        { onConflict: "slug" }
      )
      .select("id, slug, title, content, published, updated_at")
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: published ? "Page published successfully." : "Draft saved successfully.",
      page: data,
    });
  } catch (error) {
    console.error("CMS SAVE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to save the CMS page." },
      { status: 500 }
    );
  }
}
