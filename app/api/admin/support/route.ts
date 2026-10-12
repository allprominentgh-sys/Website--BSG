
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing server-side Supabase configuration.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function authorizeAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!token) {
    return null;
  }

  const supabase = getSupabaseAdmin();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .maybeSingle();

  if (
    profileError ||
    profile?.account_type !== "admin"
  ) {
    return null;
  }

  return { supabase, user };
}

export async function GET(request: NextRequest) {
  const auth = await authorizeAdmin(request);

  if (!auth) {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 }
    );
  }

  const { supabase } = auth;
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");
  const status = searchParams.get("status");
  const referred = searchParams.get("referred");
  const unassigned = searchParams.get("unassigned");

  try {
    let query = supabase
      .from("support_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (agentId) {
      query = query.eq("assigned_agent_id", agentId);
    }

    if (status && ["open", "pending", "closed"].includes(status)) {
      query = query.eq("status", status);
    }

    if (referred === "true") {
      query = query.eq("referred_to_admin", true);
    }

    if (unassigned === "true") {
      query = query.is("assigned_agent_id", null);
    }

    const [
      { data: messages, error: messagesError },
      { data: agents, error: agentsError },
    ] = await Promise.all([
      query,
      supabase
        .from("support_agents")
        .select(
          "id,slot_number,display_name,user_id,is_active,created_at"
        )
        .order("slot_number", { ascending: true }),
    ]);

    if (messagesError) throw messagesError;
    if (agentsError) throw agentsError;

    return NextResponse.json(
      {
        messages: messages ?? [],
        agents: agents ?? [],
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Support CMS load error:", error);

    return NextResponse.json(
      { error: "Unable to load support data." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await authorizeAdmin(request);

  if (!auth) {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 }
    );
  }

  const { supabase, user } = auth;

  try {
    const body = await request.json();
    const messageId = body?.messageId;

    if (
      typeof messageId !== "string" ||
      !messageId.trim()
    ) {
      return NextResponse.json(
        { error: "A valid message ID is required." },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    let auditAction = "support_message_updated";
    const auditDetails: Record<string, unknown> = {};

    if (body.status !== undefined) {
      if (
        !["open", "pending", "closed"].includes(body.status)
      ) {
        return NextResponse.json(
          { error: "Invalid support status." },
          { status: 400 }
        );
      }

      updates.status = body.status;
      auditDetails.status = body.status;
      auditAction = "status_changed";
    }

    if (body.assignedAgentId !== undefined) {
      const agentId = body.assignedAgentId;

      if (agentId !== null && typeof agentId !== "string") {
        return NextResponse.json(
          { error: "Invalid agent assignment." },
          { status: 400 }
        );
      }

      if (agentId !== null) {
        const { data: agent, error: agentError } = await supabase
          .from("support_agents")
          .select("id,is_active")
          .eq("id", agentId)
          .maybeSingle();

        if (
          agentError ||
          !agent ||
          !agent.is_active
        ) {
          return NextResponse.json(
            { error: "The selected agent is unavailable." },
            { status: 400 }
          );
        }
      }

      updates.assigned_agent_id = agentId;
      auditDetails.assigned_agent_id = agentId;
      auditAction = "assignment_changed";
    }

    if (body.referredToAdmin !== undefined) {
      if (typeof body.referredToAdmin !== "boolean") {
        return NextResponse.json(
          { error: "Invalid referral value." },
          { status: 400 }
        );
      }

      updates.referred_to_admin = body.referredToAdmin;
      updates.referred_at = body.referredToAdmin
        ? new Date().toISOString()
        : null;

      auditDetails.referred_to_admin = body.referredToAdmin;
      auditAction = body.referredToAdmin
        ? "referred_to_admin"
        : "admin_referral_cleared";
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No changes were provided." },
        { status: 400 }
      );
    }

    updates.updated_at = new Date().toISOString();

    const { data: updated, error: updateError } = await supabase
      .from("support_messages")
      .update(updates)
      .eq("id", messageId)
      .select("*")
      .maybeSingle();

    if (updateError) throw updateError;

    if (!updated) {
      return NextResponse.json(
        { error: "Support message not found." },
        { status: 404 }
      );
    }

    const { error: auditError } = await supabase
      .from("support_audit_log")
      .insert({
        message_id: updated.id,
        conversation_id: updated.conversation_id,
        actor_user_id: user.id,
        action: auditAction,
        details: auditDetails,
      });

    if (auditError) {
      console.error("Support audit logging error:", auditError);
    }

    return NextResponse.json({
      message: "Support request updated.",
      supportMessage: updated,
    });
  } catch (error) {
    console.error("Support CMS update error:", error);

    return NextResponse.json(
      { error: "Unable to update the support request." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await authorizeAdmin(request);

  if (!auth) {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 }
    );
  }

  const { supabase } = auth;

  try {
    const body = await request.json();
    const displayName =
      typeof body.displayName === "string"
        ? body.displayName.trim()
        : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!displayName || displayName.length > 100) {
      return NextResponse.json(
        { error: "Enter a valid agent name." },
        { status: 400 }
      );
    }

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Enter a valid staff email address." },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("support_agents")
      .select("id")
      .ilike("display_name", displayName)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "An agent with this name already exists." },
        { status: 409 }
      );
    }

    const { data: invitation, error: inviteError } =
      await supabase.auth.admin.inviteUserByEmail(email);

    if (inviteError || !invitation.user) {
      console.error("Support agent invitation error:", inviteError);

      return NextResponse.json(
        {
          error:
            "Unable to invite this staff member. Check the email, Auth settings, and whether the account already exists.",
        },
        { status: 400 }
      );
    }

    const { data: agent, error: insertError } = await supabase
      .from("support_agents")
      .insert({
        display_name: displayName,
        user_id: invitation.user.id,
        slot_number: null,
        is_active: true,
      })
      .select(
        "id,slot_number,display_name,user_id,is_active,created_at"
      )
      .single();

    if (insertError) {
      console.error("Support agent record error:", insertError);

      return NextResponse.json(
        {
          error:
            "The invitation was created, but the agent record could not be saved. Contact an administrator before retrying.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Staff invitation sent. The agent record has been created.",
        agent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Support agent creation error:", error);

    return NextResponse.json(
      { error: "Unable to create the support agent." },
      { status: 500 }
    );
  }
}
