import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "bsg_cms_session";

type SessionPayload = {
  staffId: string;
  companyId: string;
  employeeId: string;
  role: string;
  issuedAt: number;
  expiresAt: number;
};

function verifySession(token: string, secret: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadPart, suppliedSignature] = parts;

    const expectedSignature = createHmac("sha256", secret)
      .update(payloadPart)
      .digest("base64url");

    const supplied = Buffer.from(suppliedSignature);
    const expected = Buffer.from(expectedSignature);

    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(payloadPart, "base64url").toString("utf8")
    ) as SessionPayload;

    if (
      !payload.staffId ||
      !payload.companyId ||
      !payload.employeeId ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const secret = process.env.CMS_SESSION_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!secret || !supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { authenticated: false, error: "Server configuration is missing." },
        { status: 500 }
      );
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = verifySession(token, secret);

    if (!session) {
      const response = NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: staff, error } = await supabase
      .from("cms_staff")
      .select("id, company_id, staff_id, role, is_active")
      .eq("id", session.staffId)
      .eq("company_id", session.companyId)
      .eq("staff_id", session.employeeId)
      .maybeSingle();

    if (error) {
      console.error("CMS session database error:", error.message);
      return NextResponse.json(
        { authenticated: false, error: "Unable to verify session." },
        { status: 500 }
      );
    }

    if (!staff || staff.is_active !== true) {
      const response = NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: staff.id,
        company_id: staff.company_id,
        staff_id: staff.staff_id,
        role: staff.role,
      },
    });
  } catch (error) {
    console.error("CMS session error:", error);
    return NextResponse.json(
      { authenticated: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
