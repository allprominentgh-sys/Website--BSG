
import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TABLE = "advertising_banners";
const BUCKET = "advertising-banners";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_PLACEMENTS = new Set([
  "homepage",
  "category",
  "listing",
  "sidebar",
]);

const ALLOWED_STATUSES = new Set([
  "draft",
  "published",
  "paused",
]);

type BannerInput = {
  title?: unknown;
  description?: unknown;
  destination_url?: unknown;
  placement?: unknown;
  status?: unknown;
  display_order?: unknown;
  start_at?: unknown;
  end_at?: unknown;
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

function isValidAdminSession(request: NextRequest): boolean {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET;
    const token = request.cookies.get("bsg_admin_session")?.value;

    if (!secret || !token) return false;

    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [payload, signature] = parts;
    if (!payload || !signature) return false;

    const expected = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      return false;
    }

    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    return (
      decoded.email === "admin@bestsalesgh.com" &&
      typeof decoded.expiresAt === "number" &&
      decoded.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

function getSupabaseAdmin() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing server-side Supabase environment variables.");
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function cleanText(
  value: unknown,
  maxLength: number
): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return null;

  const text = value.trim();

  if (text.length > maxLength) return null;

  return text;
}

function validDate(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") return undefined;

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) return undefined;

  return new Date(timestamp).toISOString();
}

function validDestination(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string" || value.length > 2048) {
    return undefined;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
}

function parseBannerInput(input: BannerInput) {
  const title = cleanText(input.title, 150);
  const description = cleanText(input.description, 1000);
  const destinationUrl = validDestination(input.destination_url);

  if (!title || !title.trim()) {
    return { error: "A banner title is required." };
  }

  if (input.description != null && description === null) {
    return { error: "The description must be text under 1,000 characters." };
  }

  if (input.destination_url != null && destinationUrl === undefined) {
    return { error: "Enter a valid HTTP or HTTPS destination URL." };
  }

  const placement =
    input.placement === undefined ? "homepage" : input.placement;

  if (
    typeof placement !== "string" ||
    !ALLOWED_PLACEMENTS.has(placement)
  ) {
    return { error: "Choose a valid banner placement." };
  }

  const status =
    input.status === undefined ? "draft" : input.status;

  if (
    typeof status !== "string" ||
    !ALLOWED_STATUSES.has(status)
  ) {
    return { error: "Choose a valid banner status." };
  }

  const displayOrder =
    input.display_order === undefined ? 0 : input.display_order;

  if (
    typeof displayOrder !== "number" ||
    !Number.isInteger(displayOrder) ||
    displayOrder < 0 ||
    displayOrder > 100000
  ) {
    return { error: "Display order must be a whole number from 0 to 100000." };
  }

  const startAt = validDate(input.start_at);
  const endAt = validDate(input.end_at);

  if (startAt === undefined || endAt === undefined) {
    return { error: "Enter valid start and end dates." };
  }

  if (startAt && endAt && Date.parse(startAt) >= Date.parse(endAt)) {
    return { error: "The end date must be after the start date." };
  }

  return {
    data: {
      title: title.trim(),
      description,
      destination_url: destinationUrl,
      placement,
      status,
      display_order: displayOrder,
      start_at: startAt,
      end_at: endAt,
    },
  };
}

function getBannerId(request: NextRequest): string | null {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const id = segments[segments.length - 1];

  if (!id || id === "banners") return null;

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidPattern.test(id) ? id : null;
}

function getStoragePath(imageUrl: unknown): string | null {
  if (typeof imageUrl !== "string") return null;

  try {
    const url = new URL(imageUrl);
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const index = url.pathname.indexOf(marker);

    if (index === -1) return null;

    const path = url.pathname.slice(index + marker.length);

    if (
      !path ||
      path.split("/").some(
        (part) => part === ".." || part === "." || !part
      )
    ) {
      return null;
    }

    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  if (!isValidAdminSession(request)) {
    return jsonError("Unauthorized. Please sign in again.", 401);
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Banner list failed:", error.message);
      return jsonError("Could not load advertising banners.", 500);
    }

    return NextResponse.json(
      { success: true, banners: data ?? [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Banner GET failed:", error);
    return jsonError("Server configuration error.", 500);
  }
}

export async function POST(request: NextRequest) {
  if (!isValidAdminSession(request)) {
    return jsonError("Unauthorized. Please sign in again.", 401);
  }

  let form: FormData;

  try {
    form = await request.formData();
  } catch {
    return jsonError("Send the banner as multipart form data.", 400);
  }

  const file = form.get("image");

  if (!(file instanceof File)) {
    return jsonError("Choose a banner image to upload.", 400);
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return jsonError("Use a JPEG, PNG or WebP image.", 400);
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    return jsonError("The image must be between 1 byte and 5 MB.", 400);
  }

  const parsed = parseBannerInput({
    title: form.get("title"),
    description: form.get("description"),
    destination_url: form.get("destination_url"),
    placement: form.get("placement"),
    status: form.get("status"),
    display_order: Number(form.get("display_order") ?? 0),
    start_at: form.get("start_at") || null,
    end_at: form.get("end_at") || null,
  });

  if ("error" in parsed) {
    return jsonError(parsed.error, 400);
  }

  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  const imagePath =
    `${crypto.randomUUID()}.${extensionByType[file.type]}`;

  try {
    const supabase = getSupabaseAdmin();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(imagePath, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Banner image upload failed:", uploadError.message);
      return jsonError("Could not upload the banner image.", 500);
    }

    const { data: publicData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(imagePath);

    const { data, error: insertError } = await supabase
      .from(TABLE)
      .insert({
        ...parsed.data,
        image_url: publicData.publicUrl,
      })
      .select("*")
      .single();

    if (insertError) {
      await supabase.storage.from(BUCKET).remove([imagePath]);

      console.error("Banner database insert failed:", insertError.message);
      return jsonError("Could not save the banner details.", 500);
    }

    return NextResponse.json(
      { success: true, banner: data },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Banner POST failed:", error);
    return jsonError("Server configuration error.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  if (!isValidAdminSession(request)) {
    return jsonError("Unauthorized. Please sign in again.", 401);
  }

  const id = getBannerId(request);

  if (!id) {
    return jsonError(
      "Invalid banner ID. Use /api/admin/advertising/banners/{id} to update a banner.",
      400
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("The request body must contain valid JSON.", 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return jsonError("Provide a valid banner update object.", 400);
  }

  const input = body as Record<string, unknown>;
  const update: Record<string, unknown> = {};

  if ("title" in input) {
    const title = cleanText(input.title, 150);

    if (!title?.trim()) {
      return jsonError("A valid banner title is required.", 400);
    }

    update.title = title.trim();
  }

  if ("description" in input) {
    const description = cleanText(input.description, 1000);

    if (input.description != null && description === null) {
      return jsonError("Description must be text under 1,000 characters.", 400);
    }

    update.description = description;
  }

  if ("destination_url" in input) {
    const destinationUrl = validDestination(input.destination_url);

    if (destinationUrl === undefined) {
      return jsonError("Enter a valid HTTP or HTTPS destination URL.", 400);
    }

    update.destination_url = destinationUrl;
  }

  if ("placement" in input) {
    if (
      typeof input.placement !== "string" ||
      !ALLOWED_PLACEMENTS.has(input.placement)
    ) {
      return jsonError("Choose a valid banner placement.", 400);
    }

    update.placement = input.placement;
  }

  if ("status" in input) {
    if (
      typeof input.status !== "string" ||
      !ALLOWED_STATUSES.has(input.status)
    ) {
      return jsonError("Choose a valid banner status.", 400);
    }

    update.status = input.status;
  }

  if ("display_order" in input) {
    if (
      typeof input.display_order !== "number" ||
      !Number.isInteger(input.display_order) ||
      input.display_order < 0 ||
      input.display_order > 100000
    ) {
      return jsonError("Display order must be a whole number from 0 to 100000.", 400);
    }

    update.display_order = input.display_order;
  }

  if ("start_at" in input) {
    const startAt = validDate(input.start_at);

    if (startAt === undefined) {
      return jsonError("Enter a valid start date.", 400);
    }

    update.start_at = startAt;
  }

  if ("end_at" in input) {
    const endAt = validDate(input.end_at);

    if (endAt === undefined) {
      return jsonError("Enter a valid end date.", 400);
    }

    update.end_at = endAt;
  }

  if (Object.keys(update).length === 0) {
    return jsonError("No supported banner fields were provided.", 400);
  }

  update.updated_at = new Date().toISOString();

  try {
    const supabase = getSupabaseAdmin();

    const { data: existing, error: lookupError } = await supabase
      .from(TABLE)
      .select("id, start_at, end_at")
      .eq("id", id)
      .maybeSingle();

    if (lookupError) {
      console.error("Banner lookup failed:", lookupError.message);
      return jsonError("Could not find the banner.", 500);
    }

    if (!existing) {
      return jsonError("Banner not found.", 404);
    }

    const startAt =
      "start_at" in update ? update.start_at : existing.start_at;
    const endAt =
      "end_at" in update ? update.end_at : existing.end_at;

    if (
      startAt &&
      endAt &&
      Date.parse(String(startAt)) >= Date.parse(String(endAt))
    ) {
      return jsonError("The end date must be after the start date.", 400);
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update(update)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Banner update failed:", error.message);
      return jsonError("Could not update the banner.", 500);
    }

    return NextResponse.json(
      { success: true, banner: data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Banner PATCH failed:", error);
    return jsonError("Server configuration error.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  if (!isValidAdminSession(request)) {
    return jsonError("Unauthorized. Please sign in again.", 401);
  }

  const id = getBannerId(request);

  if (!id) {
    return jsonError(
      "Invalid banner ID. Use /api/admin/advertising/banners/{id} to delete a banner.",
      400
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: banner, error: lookupError } = await supabase
      .from(TABLE)
      .select("id, image_url")
      .eq("id", id)
      .maybeSingle();

    if (lookupError) {
      console.error("Banner lookup failed:", lookupError.message);
      return jsonError("Could not find the banner.", 500);
    }

    if (!banner) {
      return jsonError("Banner not found.", 404);
    }

    const imagePath = getStoragePath(banner.image_url);

    const { error: deleteError } = await supabase
      .from(TABLE)
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Banner delete failed:", deleteError.message);
      return jsonError("Could not delete the banner.", 500);
    }

    if (imagePath) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([imagePath]);

      if (storageError) {
        console.error("Banner image cleanup failed:", storageError.message);

        return NextResponse.json(
          {
            success: true,
            message:
              "Banner record deleted, but its image could not be removed. Check Storage manually.",
          },
          { headers: { "Cache-Control": "no-store" } }
        );
      }
    }

    return NextResponse.json(
      { success: true, message: "Banner deleted successfully." },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Banner DELETE failed:", error);
    return jsonError("Server configuration error.", 500);
  }
}
