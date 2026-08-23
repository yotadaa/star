const windows = new Map();

export function consumeRequestWindow(bucket, key, { limit, windowMs }) {
  const now = Date.now();
  const windowKey = `${bucket}:${key}`;
  const current = windows.get(windowKey);
  const entry = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : current;
  entry.count += 1;
  windows.set(windowKey, entry);

  if (windows.size > 1_000) {
    for (const [storedKey, stored] of windows) {
      if (stored.resetAt <= now) windows.delete(storedKey);
    }
  }

  return {
    allowed: entry.count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

export function requestOriginAllowed(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const expectedHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).host;
    return new URL(origin).host === expectedHost;
  } catch {
    return false;
  }
}
