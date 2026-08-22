import { ConvexHttpClient } from "convex/browser";

let client;
let clientUrl;

export function getConvexServerClient() {
  const deploymentUrl = String(process.env.CONVEX_CLOUD_URL || "").trim().replace(/\/+$/, "");
  if (!deploymentUrl) {
    const error = new Error("CONVEX_CLOUD_URL is not configured on the Next.js server.");
    error.code = "CONVEX_CLOUD_ENV_MISSING";
    throw error;
  }

  if (!client || clientUrl !== deploymentUrl) {
    client = new ConvexHttpClient(deploymentUrl);
    clientUrl = deploymentUrl;
  }
  return client;
}

export async function queryConvex(functionReference, args = {}) {
  return await getConvexServerClient().query(functionReference, args);
}

export async function actionConvex(functionReference, args = {}) {
  return await getConvexServerClient().action(functionReference, args);
}
