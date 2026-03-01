import { APP_NAME } from "../shared/constants";
import { log } from "../shared/logger";
import { sendMessage } from "../shared/messageClient";
import { candidateAdapters } from "./capture/adapters";
import { discoverCandidates, pickBestCandidate } from "./capture/discovery";

/**
 * Content script entrypoint.
 * Candidate detection/highlighting will be added in upcoming plan steps.
 */
console.info(`[${APP_NAME}] Content script loaded on page.`);

const discoveredCandidates = discoverCandidates(document, candidateAdapters);
const bestCandidate = pickBestCandidate(discoveredCandidates);

if (bestCandidate) {
  log(
    "debug",
    `Candidate pipeline selected ${bestCandidate.type} (${bestCandidate.confidence.toFixed(2)}).`,
    "content"
  );
} else {
  log("debug", "Candidate pipeline found no candidates on load.", "content");
}

void sendMessage("health.ping", { source: "content" })
  .then((response) => {
    log("debug", `Background ping ok at ${response.nowIso}`, "content");
  })
  .catch((error: unknown) => {
    log("warn", "Background ping failed (non-blocking).", "content", error);
  });
