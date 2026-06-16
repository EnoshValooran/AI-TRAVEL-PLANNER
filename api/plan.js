import { generatePlan, validateTripInput } from "../lib/travelPlanner.js";

const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function isRateLimited(req) {
  const now = Date.now();
  const ip = clientIp(req);
  const bucket = rateLimitStore.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  bucket.count += 1;
  rateLimitStore.set(ip, bucket);
  return bucket.count > RATE_LIMIT_MAX;
}

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed." });
    return;
  }

  if (isRateLimited(req)) {
    sendJson(res, 429, { error: "Too many requests. Please wait a minute and try again." });
    return;
  }

  try {
    const trip = validateTripInput(req.body || {});
    const plan = await generatePlan(trip);
    sendJson(res, 200, { plan });
  } catch (error) {
    sendJson(res, error.status || 500, { error: error.message || "Something went wrong." });
  }
}
