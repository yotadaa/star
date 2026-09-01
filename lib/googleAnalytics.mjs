export const GOOGLE_ANALYTICS_ID_PATTERN = /^G-[A-Z0-9]{6,20}$/;

export function configuredGoogleAnalyticsId(environment = process.env) {
  const measurementId = String(environment.GOOGLE_ANALYTICS_ID || "").trim();
  return GOOGLE_ANALYTICS_ID_PATTERN.test(measurementId) ? measurementId : "";
}
