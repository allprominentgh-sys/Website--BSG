
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

export const CMS_COOKIE_NAME = "bsg_cms_session";

export const CMS_IDLE_TIMEOUT_MS = 15 * 60 * 1000;
export const CMS_SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export type CmsSessionPayload = {
  staffId: string;
  companyId: string;
  employeeId: string;
  role: string;
  issuedAt: number;
  expiresAt: number;
  sessionId: string;
};

export type VerifiedCmsStaff = {
  id: string;
  company_id: string;
  staff_id: string;
  role: string;
};

function verifySignature(
  payload: string,
  suppliedSignature: string,
  secret: string
): boolean {
  try {
    const expected = createHmac("sha256", secret)
      .update(payload)
      .digest();

    const supplied = Buffer.from(suppliedSignature, "base64url");

    return (
      supplied.length === expected.length &&
      timingSafeEqual(expected, supplied)
    );
  } catch {
    return false;
  }
}

export function signCmsPayload(
  payload: string,
  secret: string
): string {
  return createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
}

export function createCmsSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("CMS server configuration is missing.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function getCmsStaffSession(): Promise<{
  session: CmsSessionPayload;
  staff: VerifiedCmsStaff;
} | null> {
  try {
    const secret = process.env.CMS_SESSION_SECRET;

    if (!secret) {
      console.error("CMS_SESSION_SECRET is missing.");
      return null;
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(CMS_COOKIE_NAME)?.value;

    if (!token || token.length > 8192) {
      return null;
    }

    const separator = token.lastIndexOf(".");

    if (separator <= 0 || separator === token.length - 1) {
      return null;
    }

    const encodedPayload = token.slice(0, separator);
    const signature = token.slice(separator + 1);

    if (!verifySignature(encodedPayload, signature, secret)) {
      return null;
    }

    let session: CmsSessionPayload;

    try {
      session = JSON.parse(
        Buffer.from(encodedPayload, "base64url").toString("utf8")
      );
    } catch {
      return null;
    }

    const now = Date.now();

    if (
      !session ||
      typeof session.staffId !== "string" ||
      typeof session.companyId !== "string" ||
      typeof session.employeeId !== "string" ||
      typeof session.role !== "string" ||
      typeof session.sessionId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        session.sessionId
      ) ||
      typeof session.issuedAt !== "number" ||
      typeof session.expiresAt !== "number" ||
      !Number.isFinite(session.issuedAt) ||
      !Number.isFinite(session.expiresAt) ||
      session.issuedAt > now + 60_000 ||
      session.expiresAt <= now ||
      session.expiresAt <= session.issuedAt ||
      session.expiresAt - session.issuedAt >
        CMS_SESSION_DURATION_MS
    ) {
      return null;
    }

    const supabase = createCmsSupabaseClient();

    const { data: activity, error: activityError } = await supabase
      .from("cms_session_activity")
      .select("session_id, staff_id, company_id, last_activity_at, expires_at")
      .eq("session_id", session.sessionId)
      .eq("staff_id", session.staffId)
      .eq("company_id", session.companyId)
      .maybeSingle();

    if (activityError || !activity) {
      return null;
    }

    const lastActivityAt = Date.parse(activity.last_activity_at);
    const storedExpiry = Date.parse(activity.expires_at);

    if (
      !Number.isFinite(lastActivityAt) ||
      !Number.isFinite(storedExpiry) ||
      storedExpiry <= now ||
      storedExpiry !== session.expiresAt ||
      lastActivityAt > now + 60_000 ||
      now - lastActivityAt >= CMS_IDLE_TIMEOUT_MS
    ) {
      return null;
    }

    const { data: staff, error: staffError } = await supabase
      .from("cms_staff")
      .select("id, company_id, staff_id, password_hash, is_active, role")
      .eq("id", session.staffId)
      .eq("company_id", session.companyId)
      .eq("staff_id", session.employeeId)
      .eq("is_active", true)
      .maybeSingle();

    if (staffError || !staff) {
      return null;
    }

    if (
      typeof staff.role !== "string" ||
      staff.role.toLowerCase() !== session.role.toLowerCase()
    ) {
      return null;
    }

    return {
      session,
      staff: {
        id: staff.id,
        company_id: staff.company_id,
        staff_id: staff.staff_id,
        role: staff.role,
      },
    };
  } catch (error) {
    console.error("CMS session verification failed:", error);
    return null;
  }
}
