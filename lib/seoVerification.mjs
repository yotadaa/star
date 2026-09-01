const VERIFICATION_TOKEN_PATTERN = /^[A-Za-z0-9._=-]{6,256}$/;

function verificationToken(value) {
  const token = String(value || "").trim();
  return VERIFICATION_TOKEN_PATTERN.test(token) ? token : "";
}

export function siteVerificationMetadata(environment = process.env) {
  const google = verificationToken(environment.GOOGLE_SITE_VERIFICATION);
  const bing = verificationToken(environment.BING_SITE_VERIFICATION);
  const ahrefs = verificationToken(environment.AHREFS_SITE_VERIFICATION);
  const other = {
    ...(bing ? { "msvalidate.01": bing } : {}),
    ...(ahrefs ? { "ahrefs-site-verification": ahrefs } : {}),
  };

  if (!google && !Object.keys(other).length) return {};

  return {
    verification: {
      ...(google ? { google } : {}),
      ...(Object.keys(other).length ? { other } : {}),
    },
  };
}
