
import { NextResponse } from "next/server";
import { getCmsStaffSession } from "@/lib/cms-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getCmsStaffSession();

  if (!result) {
    return NextResponse.json(
      {
        authenticated: false,
        message: "No valid CMS staff session was found.",
      },
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
      staff: {
        staff_id: result.staff.staff_id,
        role: result.staff.role,
      },
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
