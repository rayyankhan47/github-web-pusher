import { APP_NAME } from "../shared/constants";

/**
 * Background service worker entrypoint.
 * It will own auth, storage, and GitHub API interactions in later steps.
 */
console.info(`[${APP_NAME}] Background service worker initialized.`);
