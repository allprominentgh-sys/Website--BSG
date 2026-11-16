
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { sendPushNotification } from "@/lib/push";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const secret = process.env.INTERNAL_PUSH_WEBHOOK_SECRET;
  const authorization = request.headers.get("authorization");

  if (!secret || !authorization) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authorization);

  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const payload = await request.json();

    if (
      payload?.type !== "INSERT" ||
      payload?.table !== "notifications" ||
      payload?.schema !== "public" ||
      !payload?.record
    ) {
      return NextResponse.json(
        { error: "Unsupported notification event." },
        { status: 400 }
      );
    }

    const notification = payload.record;

    const userId = notification.user_id;
    const title = notification.title;
    const body = notification.body || "You have a new notification.";
    const href = notification.href || "/dashboard/notifications";

    if (
      typeof userId !== "string" ||
      typeof title !== "string" ||
      typeof body !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid notification record." },
        { status: 400 }
      );
    }

    const result = await sendPushNotification({
      userId,
      title,
      body,
      url: href,
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Push webhook error:", error);

    return NextResponse.json(
      { error: "Could not process push notification." },
      { status: 500 }
    );
  }
}
