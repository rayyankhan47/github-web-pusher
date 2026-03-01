import { APP_NAME } from "../shared/constants";
import { log } from "../shared/logger";
import { registerMessageRouter } from "./messageRouter";

/**
 * Background service worker entrypoint.
 * It will own auth, storage, and GitHub API interactions in later steps.
 */
registerMessageRouter();
log("info", "Background service worker initialized.", "background");
console.info(`[${APP_NAME}] Message router registered.`);
