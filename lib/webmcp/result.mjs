export const WEBMCP_RESULT_LIMIT = 1500;

export class WebMcpToolError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "WebMcpToolError";
    this.code = code;
  }
}

export function encodeWebMcpResult(value) {
  const encoded = JSON.stringify({ ok: true, ...value });
  if (encoded.length <= WEBMCP_RESULT_LIMIT) return encoded;
  return JSON.stringify({
    ok: false,
    error: "OUTPUT_TOO_LARGE",
    message: `Tool output exceeded ${WEBMCP_RESULT_LIMIT} characters. Narrow the request.`,
  });
}

export function encodeWebMcpError(error) {
  const code = error?.name === "AbortError"
    ? "ABORTED"
    : (error?.code || "UNAVAILABLE");
  const message = error instanceof WebMcpToolError
    ? error.message
    : (code === "ABORTED" ? "Tool execution was canceled." : "The requested public data is unavailable.");
  return JSON.stringify({ ok: false, error: code, message });
}
