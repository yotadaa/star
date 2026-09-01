import assert from "node:assert/strict";
import { configuredGoogleAnalyticsId } from "../lib/googleAnalytics.mjs";
import { siteVerificationMetadata } from "../lib/seoVerification.mjs";

const fixtureMeasurementId = `G-${"A1".repeat(5)}`;

assert.equal(
  configuredGoogleAnalyticsId({ GOOGLE_ANALYTICS_ID: ` ${fixtureMeasurementId} ` }),
  fixtureMeasurementId,
);
assert.equal(configuredGoogleAnalyticsId({}), "");
assert.equal(configuredGoogleAnalyticsId({ GOOGLE_ANALYTICS_ID: "not-a-measurement-id" }), "");
assert.equal(configuredGoogleAnalyticsId({ GOOGLE_ANALYTICS_ID: "G-ABC123';alert(1)//" }), "");
assert.equal(configuredGoogleAnalyticsId({ NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: fixtureMeasurementId }), "");

assert.deepEqual(siteVerificationMetadata({}), {});
assert.deepEqual(
  siteVerificationMetadata({
    GOOGLE_SITE_VERIFICATION: "google_token-123",
    BING_SITE_VERIFICATION: "bing_token-456",
    AHREFS_SITE_VERIFICATION: "ahrefs_token-789",
  }),
  {
    verification: {
      google: "google_token-123",
      other: {
        "msvalidate.01": "bing_token-456",
        "ahrefs-site-verification": "ahrefs_token-789",
      },
    },
  },
);
assert.deepEqual(
  siteVerificationMetadata({
    GOOGLE_SITE_VERIFICATION: '<meta name="google-site-verification">',
    BING_SITE_VERIFICATION: "too short",
    AHREFS_SITE_VERIFICATION: "javascript:alert(1)",
  }),
  {},
);

process.stdout.write("SEO environment boundary verification passed.\n");
