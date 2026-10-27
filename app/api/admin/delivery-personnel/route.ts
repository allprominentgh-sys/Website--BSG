
function verifyAdminSession(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const cookie = request.cookies.get(COOKIE_NAME)?.value;

  if (!secret || !cookie) return false;

  try {
    const parts = cookie.split(".");
    if (parts.length !== 2) return false;

    const [payload, suppliedSignature] = parts;
    if (!payload || !suppliedSignature) return false;

    const expectedSignature = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const supplied = Buffer.from(suppliedSignature, "utf8");
    const expected = Buffer.from(expectedSignature, "utf8");

    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) {
      return false;
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as {
      email?: string;
      expiresAt?: number;
    };

    return (
      session.email === ADMIN_EMAIL &&
      typeof session.expiresAt === "number" &&
      Number.isFinite(session.expiresAt) &&
      session.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}
