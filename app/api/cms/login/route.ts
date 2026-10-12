import { NextResponse } from “next/server”;
import { createClient } from “@supabase/supabase-js”;

export const runtime = “nodejs”;

export async function POST(request: Request) {
try {
const body = await request.json();

const companyId =
  typeof body.companyId === "string" ? body.companyId.trim() : "";
const staffId =
  typeof body.staffId === "string" ? body.staffId.trim() : "";
const password =
  typeof body.password === "string" ? body.password : "";
if (!companyId || !staffId || !password) {
  return NextResponse.json(
    { error: "Enter your Company ID, Staff ID and password." },
    { status: 400 }
  );
}
if (
  companyId.length > 100 ||
  staffId.length > 100 ||
  password.length > 1024
) {
  return NextResponse.json(
    { error: "The supplied login details are invalid." },
    { status: 400 }
  );
}
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.error("CMS authentication environment is not configured.");
  return NextResponse.json(
    { error: "Staff login is not configured yet. Contact the administrator." },
    { status: 503 }
  );
}
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
// The staff registry must be created in Supabase before this
// endpoint can authenticate staff.
const { data: staff, error: staffError } = await supabase
  .from("cms_staff")
  .select("id, company_id, staff_id, auth_user_id, role, active")
  .eq("company_id", companyId)
  .eq("staff_id", staffId)
  .eq("active", true)
  .maybeSingle();
if (staffError) {
  console.error("CMS staff lookup failed:", staffError.message);
  return NextResponse.json(
    { error: "Staff authentication is not configured. Contact the administrator." },
    { status: 503 }
  );
}
if (!staff || !staff.auth_user_id) {
  return NextResponse.json(
    { error: "Invalid login details or inactive staff account." },
    { status: 401 }
  );
}
// Check the supplied password through Supabase Auth.
// Passwords are never stored in the cms_staff table.
const { data: authData, error: authError } =
  await supabase.auth.signInWithPassword({
    email: "",
    password,
  });
// Staff IDs are not email addresses. The account's registered
// email must be stored in the staff registry.
// This check intentionally fails until that field is configured.
if (authError || !authData.user) {
  return NextResponse.json(
    {
      error:
        "Staff email mapping is not configured. Contact the administrator.",
    },
    { status: 401 }
  );
}
if (authData.user.id !== staff.auth_user_id) {
  await supabase.auth.signOut();
  return NextResponse.json(
    { error: "Invalid login details." },
    { status: 401 }
  );
}
return NextResponse.json({
  error:
    "The secure session handoff is not yet configured. Please complete the CMS authentication setup.",
}, { status: 501 });

} catch (error) {
console.error(“CMS login API failed:”, error);

return NextResponse.json(
  { error: "An unexpected login error occurred. Please try again." },
  { status: 500 }
);

}
}
