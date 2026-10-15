import { NextRequest, NextResponse } from “next/server”;
import { getSupabaseAdmin } from “@/lib/supabase-admin”;

export const dynamic = “force-dynamic”;

async function authorizeAdmin(request: NextRequest) {
const authorization = request.headers.get(“authorization”);
const token = authorization?.startsWith(“Bearer “)
? authorization.slice(7)
: “”;

if (!token) {
return null;
}

let supabase: ReturnType;

try {
supabase = getSupabaseAdmin();
} catch (error) {
console.error(
“Support API: Supabase configuration failed.”,
error instanceof Error ? error.message : “Unknown error”
);
return null;
}

const {
data: { user },
error,
} = await supabase.auth.getUser(token);

if (error || !user) {
return null;
}

const { data: profile, error: profileError } = await supabase
.from(“profiles”)
.select(“account_type”)
.eq(“id”, user.id)
.maybeSingle();

if (profileError) {
console.error(
“Support API: profile lookup failed.”,
profileError.message
);
return null;
}

if (!profile || profile.account_type !== “admin”) {
return null;
}

return { supabase, user };
}

export async function GET(request: NextRequest) {
const authorization = await authorizeAdmin(request);

if (!authorization) {
return NextResponse.json(
{ error: “Unauthorized. Administrator access is required.” },
{ status: 401 }
);
}

return NextResponse.json({
success: true,
message: “Admin support API authorization successful.”,
});
}
