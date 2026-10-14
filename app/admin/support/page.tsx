
async function authorizeAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!token) {
    console.error("Support API auth: missing Bearer token.");
    return null;
  }

  let supabase;

  try {
    supabase = getSupabaseAdmin();
  } catch (error) {
    console.error(
      "Support API auth: Supabase server configuration failed.",
      error instanceof Error ? error.message : "Unknown error"
    );
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    console.error("Support API auth: token validation failed.", {
      message: error?.message,
      status: error?.status,
    });
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Support API auth: profile lookup failed.", {
      message: profileError.message,
      code: profileError.code,
    });
    return null;
  }

  if (!profile || profile.account_type !== "admin") {
    console.error("Support API auth: admin role check failed.", {
      userId: user.id,
      accountType: profile?.account_type ?? null,
      profileFound: Boolean(profile),
    });
    return null;
  }

  return { supabase, user };
}
