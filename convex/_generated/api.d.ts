/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as blog from "../blog.js";
import type * as bridge from "../bridge.js";
import type * as contact from "../contact.js";
import type * as content from "../content.js";
import type * as files from "../files.js";
import type * as inventory from "../inventory.js";
import type * as migrationAudit from "../migrationAudit.js";
import type * as migrations from "../migrations.js";
import type * as nalaSettings from "../nalaSettings.js";
import type * as records from "../records.js";
import type * as validators from "../validators.js";
import type * as worldChat from "../worldChat.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  blog: typeof blog;
  bridge: typeof bridge;
  contact: typeof contact;
  content: typeof content;
  files: typeof files;
  inventory: typeof inventory;
  migrationAudit: typeof migrationAudit;
  migrations: typeof migrations;
  nalaSettings: typeof nalaSettings;
  records: typeof records;
  validators: typeof validators;
  worldChat: typeof worldChat;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  migrations: import("@convex-dev/migrations/_generated/component.js").ComponentApi<"migrations">;
};
