import { APP_NAME } from "../shared/constants";
import { log } from "../shared/logger";
import { sendMessage } from "../shared/messageClient";

/**
 * Content script entrypoint.
 * Candidate detection/highlighting will be added in upcoming plan steps.
 */
console.info(`[${APP_NAME}] Content script loaded on page.`);

void sendMessage("health.ping", { source: "content" })
  .then((response) => {
    log("debug", `Background ping ok at ${response.nowIso}`, "content");
  })
  .catch((error: unknown) => {
    log("warn", "Background ping failed (non-blocking).", "content", error);
  });
