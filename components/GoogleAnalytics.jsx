import Script from "next/script";
import { configuredGoogleAnalyticsId } from "@/lib/googleAnalytics.mjs";

export default function GoogleAnalytics() {
  const measurementId = configuredGoogleAnalyticsId();
  if (!measurementId) return null;

  const serializedMeasurementId = JSON.stringify(measurementId).replace(/</g, "\\u003c");

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', ${serializedMeasurementId});
        `}
      </Script>
    </>
  );
}
