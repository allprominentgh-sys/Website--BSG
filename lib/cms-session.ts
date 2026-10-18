
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

export const CMS_COOKIE_NAME = "bsg_cms_session";

export type CmsSessionPayload = {
  staffId: string;
  companyId: string;
  employeeId: string;
  role: string;
  issuedAt: number;
  expiresAt: number;
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
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest();

  let supplied: Buffer;

  try {
    supplied = Buffer.from(suppliedSignature, "base64url");
  } catch {
    return false;
  }

  if (supplied.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(expected, supplied);
}

export async function getCmsStaffSession(): Promise<{
  session: CmsSessionPayload;
  staff: VerifiedCmsStaff;
} | null> {
  try {
    const secret = process.env.CMS_SESSION_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!secret || !supabaseUrl || !serviceRoleKey) {
      console.error("CMS session configuration is missing.");
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

    if (
      !verifySignature(encodedPayload, signature, secret)
    ) {
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
      typeof session.issuedAt !== "number" ||
      typeof session.expiresAt !== "number" ||
      !Number.isFinite(session.issuedAt) ||
      !Number.isFinite(session.expiresAt) ||
      session.issuedAt > now + 60_000 ||
      session.expiresAt <= now ||
      session.expiresAt <= session.issuedAt ||
      session.expiresAt - session.issuedAt > 8 * 60 * 60 * 1000
    ) {
      return null;
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: staff, error } = await supabase
      .from("cms_staff")
      .select("id, company_id, staff_id, role, is_active")
      .eq("id", session.staffId)
      .eq("company_id", session.companyId)
      .eq("staff_id", session.employeeId)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !staff) {
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
