
import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

type WebPushSubscription = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

type WebPushModule = {
  setVapidDetails: (
    subject: string,
    publicKey: string,
    privateKey: string
  ) => void;
  sendNotification: (
    subscription: WebPushSubscription,
    payload: string
  ) => Promise<unknown>;
};

const webpush = require("web-push") as WebPushModule;

type PushMessage = {
  userId: string;
  title: string;
  body: string;
  url?: string;
};

export async function sendPushNotification({
  userId,
  title,
  body,
  url = "/dashboard/notifications",
}: PushMessage) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error("Push notification keys are not configured.");
  }

  if (!userId || !title || !body) {
    throw new Error("User ID, title and body are required.");
  }

  if (!url.startsWith("/") || url.startsWith("//")) {
    throw new Error("Push notification URL must be a safe relative path.");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const supabase = getSupabaseAdmin();

  const { data: subscriptions, error } = await supabase
    .from("bsg_push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) {
    throw new Error("Could not load push subscriptions.");
  }

  if (!subscriptions || subscriptions.length === 0) {
    return {
      sent: 0,
      message: "This user has no registered push devices.",
    };
  }

  const payload = JSON.stringify({
    title,
    body,
    url,
  });

  let sent = 0;
  const expiredIds: string[] = [];

  for (const item of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: item.endpoint,
          keys: {
            p256dh: item.p256dh,
            auth: item.auth,
          },
        },
        payload
      );

      sent++;
    } catch (error) {
      const statusCode =
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error
          ? Number(error.statusCode)
          : 0;

      if (statusCode === 404 || statusCode === 410) {
        expiredIds.push(item.id);
      } else {
        console.error("Push delivery failed:", statusCode);
      }
    }
  }

  if (expiredIds.length > 0) {
    await supabase
      .from("bsg_push_subscriptions")
      .delete()
      .in("id", expiredIds);
  }

  return {
    sent,
    total: subscriptions.length,
    expired: expiredIds.length,
  };
}
