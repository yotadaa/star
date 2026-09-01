export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_KEY_PATH = "/indexnow-key.txt";
export const INDEXNOW_MAX_URLS = 10_000;

const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;

export class IndexNowError extends Error {
  constructor(message, { code = "INDEXNOW_ERROR", status } = {}) {
    super(message);
    this.name = "IndexNowError";
    this.code = code;
    if (status) this.status = status;
  }
}
export function validateIndexNowKey(value) {
  const key = String(value || "").trim();
  if (!INDEXNOW_KEY_PATTERN.test(key)) {
    throw new IndexNowError(
      "The configured IndexNow key must contain 8 to 128 letters, numbers, or dashes.",
      { code: "INDEXNOW_KEY_INVALID" },
    );
  }
  return key;
}

export function configuredIndexNowKeyFromEnvironment(environment = process.env) {
  return validateIndexNowKey(
    environment.AHREFS_INDEXNOW_KEY || environment.INDEXNOW_API_KEY,
  );
}

export function normalizeSiteOrigin(value) {
  try {
    const url = new URL(String(value || "").trim());
    if (!/^https?:$/.test(url.protocol) || url.username || url.password) throw new Error();
    return url.origin;
  } catch {
    throw new IndexNowError("The canonical site origin is invalid.", {
      code: "INDEXNOW_SITE_ORIGIN_INVALID",
    });
  }
}

export function normalizeIndexNowUrls(urls, siteOrigin) {
  const origin = normalizeSiteOrigin(siteOrigin);
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new IndexNowError("At least one changed URL is required.", {
      code: "INDEXNOW_URLS_EMPTY",
    });
  }
  if (urls.length > INDEXNOW_MAX_URLS) {
    throw new IndexNowError(`IndexNow accepts at most ${INDEXNOW_MAX_URLS} URLs per request.`, {
      code: "INDEXNOW_URL_LIMIT",
    });
  }

  const normalized = [];
  const seen = new Set();
  for (const candidate of urls) {
    let url;
    try {
      url = new URL(String(candidate || ""), `${origin}/`);
    } catch {
      throw new IndexNowError("A changed URL is invalid.", { code: "INDEXNOW_URL_INVALID" });
    }
    url.hash = "";
    if (url.origin !== origin) {
      throw new IndexNowError("Every IndexNow URL must use the canonical site host.", {
        code: "INDEXNOW_URL_HOST_MISMATCH",
      });
    }
    const value = url.toString();
    if (!seen.has(value)) {
      seen.add(value);
      normalized.push(value);
    }
  }

  return normalized;
}

export function createIndexNowPayload({ key, siteOrigin, urls, keyPath = INDEXNOW_KEY_PATH }) {
  const validKey = validateIndexNowKey(key);
  const origin = normalizeSiteOrigin(siteOrigin);
  const urlList = normalizeIndexNowUrls(urls, origin);
  const keyLocation = new URL(keyPath, `${origin}/`);
  if (keyLocation.origin !== origin) {
    throw new IndexNowError("The IndexNow key file must be hosted on the canonical site.", {
      code: "INDEXNOW_KEY_LOCATION_INVALID",
    });
  }

  return {
    host: new URL(origin).host,
    key: validKey,
    keyLocation: keyLocation.toString(),
    urlList,
  };
}

export async function submitIndexNowUrls({
  key,
  siteOrigin,
  urls,
  keyPath = INDEXNOW_KEY_PATH,
  fetchImpl = fetch,
  timeoutMs = 8_000,
}) {
  const payload = createIndexNowPayload({ key, siteOrigin, urls, keyPath });
  let response;
  try {
    response = await fetchImpl(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new IndexNowError(
      error?.name === "TimeoutError"
        ? "IndexNow did not acknowledge the request before the timeout."
        : "IndexNow could not be reached.",
      { code: error?.name === "TimeoutError" ? "INDEXNOW_TIMEOUT" : "INDEXNOW_UNREACHABLE" },
    );
  }

  if (response.status !== 200 && response.status !== 202) {
    throw new IndexNowError(`IndexNow rejected the URL update with HTTP ${response.status}.`, {
      code: "INDEXNOW_REJECTED",
      status: response.status,
    });
  }

  return {
    ok: true,
    status: response.status,
    submitted: payload.urlList.length,
    host: payload.host,
    keyLocation: payload.keyLocation,
  };
}
