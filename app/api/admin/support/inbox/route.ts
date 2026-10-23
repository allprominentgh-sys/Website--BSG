
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "admin@bestsalesgh.com";
const COOKIE_NAME = "bsg_admin_session";

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

function verifyAdminSession(
  token: string,
  secret: string
): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;

  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    return (
      session.email === ADMIN_EMAIL &&
      typeof session.expiresAt === "number" &&
      session.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET;
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!secret || !supabaseUrl || !serviceKey) {
      return errorResponse(
        "Server configuration is incomplete.",
        500
      );
    }

    if (!token || !verifyAdminSession(token, secret)) {
      return errorResponse(
        "Administrator session is missing or expired.",
        401
      );
    }

    const db = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const requestedLimit = Number(
      request.nextUrl.searchParams.get("limit") ?? "100"
    );

    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.floor(requestedLimit), 1), 200)
      : 100;

    const [
      { data: messages, error: messagesError },
      { data: agents, error: agentsError },
    ] = await Promise.all([
      db
        .from("support_messages")
        .select(
          "id, user_id, sender_role, message, created_at, subject, status, conversation_id, assigned_agent_id, referred_to_admin, referred_at, updated_at"
        )
        .order("updated_at", { ascending: false })
        .limit(limit),

      db
        .from("support_agents")
        .select(
          "id, slot_number, display_name, user_id, is_active, created_at, updated_at"
        )
        .order("slot_number", { ascending: true }),
    ]);

    if (messagesError) {
      console.error(
        "Support inbox messages query failed:",
        messagesError.message
      );

      return errorResponse(
        "Unable to load support messages.",
        500
      );
    }

    if (agentsError) {
      console.error(
        "Support inbox agents query failed:",
        agentsError.message
      );

      return errorResponse(
        "Unable to load support agents.",
        500
      );
    }

    return NextResponse.json(
      {
        success: true,
        messages: messages ?? [],
        agents: agents ?? [],
        count: messages?.length ?? 0,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Support inbox API error:", error);

    return errorResponse(
      "Unexpected error while loading the support inbox.",
      500
    );
  }
}
