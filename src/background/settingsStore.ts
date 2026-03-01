import { AppError } from "../shared/errors";
import type { AppSettings, HostOverride } from "../shared/models";
import {
  DEFAULT_APP_SETTINGS,
  SETTINGS_STORAGE_KEY,
  SETTINGS_VERSION,
  mergeSettings,
  toPublicSettings
} from "../shared/settings";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function migrateSettings(raw: unknown): AppSettings {
  if (!isPlainObject(raw)) {
    return { ...DEFAULT_APP_SETTINGS };
  }

  // v0 to v1 migration shape (best-effort for early experimental formats).
  const maybeDefaultBranch =
    typeof raw.defaultBranch === "string" && raw.defaultBranch.trim().length > 0
      ? raw.defaultBranch
      : DEFAULT_APP_SETTINGS.defaultBranch;

  const maybeHostOverrides = Array.isArray(raw.hostOverrides)
    ? raw.hostOverrides.filter(isPlainObject).map(toHostOverride)
    : DEFAULT_APP_SETTINGS.hostOverrides;

  const maybeDefaultOwner = typeof raw.defaultOwner === "string" ? raw.defaultOwner : undefined;
  const maybeDefaultRepo = typeof raw.defaultRepo === "string" ? raw.defaultRepo : undefined;
  const maybeGithubToken = typeof raw.githubToken === "string" ? raw.githubToken : undefined;

  const migrated: AppSettings = {
    version: SETTINGS_VERSION,
    defaultBranch: maybeDefaultBranch,
    ...(maybeDefaultOwner ? { defaultOwner: maybeDefaultOwner } : {}),
    ...(maybeDefaultRepo ? { defaultRepo: maybeDefaultRepo } : {}),
    ...(maybeGithubToken ? { githubToken: maybeGithubToken } : {}),
    hostOverrides: maybeHostOverrides
  };

  return migrated;
}

function toHostOverride(raw: Record<string, unknown>): HostOverride {
  const host = typeof raw.host === "string" ? raw.host : "";
  const defaultRepo = typeof raw.defaultRepo === "string" ? raw.defaultRepo : undefined;
  const baseFolder = typeof raw.baseFolder === "string" ? raw.baseFolder : undefined;
  const defaultExtension =
    typeof raw.defaultExtension === "string" ? raw.defaultExtension : undefined;

  return {
    host,
    ...(defaultRepo ? { defaultRepo } : {}),
    ...(baseFolder ? { baseFolder } : {}),
    ...(defaultExtension ? { defaultExtension } : {})
  };
}

export async function loadSettings(): Promise<AppSettings> {
  const stored = await chrome.storage.local.get(SETTINGS_STORAGE_KEY);
  const migrated = migrateSettings(stored[SETTINGS_STORAGE_KEY]);
  return mergeSettings(DEFAULT_APP_SETTINGS, migrated);
}

export async function saveSettings(next: AppSettings): Promise<AppSettings> {
  const normalized = mergeSettings(DEFAULT_APP_SETTINGS, next);
  await chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: normalized });
  return normalized;
}

export async function patchSettings(
  patch: Partial<Omit<AppSettings, "version">>
): Promise<AppSettings> {
  const current = await loadSettings();
  const updated = mergeSettings(current, patch);
  return saveSettings(updated);
}

export type SettingsChangeListener = (settings: AppSettings) => void;

export function subscribeSettings(listener: SettingsChangeListener): () => void {
  const changeHandler = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string
  ): void => {
    if (areaName !== "local" || !changes[SETTINGS_STORAGE_KEY]) {
      return;
    }

    const migrated = migrateSettings(changes[SETTINGS_STORAGE_KEY].newValue);
    listener(mergeSettings(DEFAULT_APP_SETTINGS, migrated));
  };

  chrome.storage.onChanged.addListener(changeHandler);
  return () => chrome.storage.onChanged.removeListener(changeHandler);
}

export async function getGithubToken(): Promise<string> {
  const settings = await loadSettings();

  if (!settings.githubToken || settings.githubToken.trim().length === 0) {
    throw new AppError("GitHub token is not configured.", "GITHUB_TOKEN_MISSING");
  }

  return settings.githubToken;
}

export async function loadPublicSettings(): Promise<ReturnType<typeof toPublicSettings>> {
  const settings = await loadSettings();
  return toPublicSettings(settings);
}
