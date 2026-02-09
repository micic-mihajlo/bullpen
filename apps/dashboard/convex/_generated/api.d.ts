/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentMessages from "../agentMessages.js";
import type * as agents from "../agents.js";
import type * as cleanup from "../cleanup.js";
import type * as clients from "../clients.js";
import type * as deliverables from "../deliverables.js";
import type * as events from "../events.js";
import type * as messages from "../messages.js";
import type * as projects from "../projects.js";
import type * as seed from "../seed.js";
import type * as taskExecution from "../taskExecution.js";
import type * as tasks from "../tasks.js";
import type * as workerTemplates from "../workerTemplates.js";
import type * as workers from "../workers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agentMessages: typeof agentMessages;
  agents: typeof agents;
  cleanup: typeof cleanup;
  clients: typeof clients;
  deliverables: typeof deliverables;
  events: typeof events;
  messages: typeof messages;
  projects: typeof projects;
  seed: typeof seed;
  taskExecution: typeof taskExecution;
  tasks: typeof tasks;
  workerTemplates: typeof workerTemplates;
  workers: typeof workers;
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

export declare const components: {};
