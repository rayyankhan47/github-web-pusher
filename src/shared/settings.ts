import type { AppSettings, HostOverride } from "./models";

export const SETTINGS_STORAGE_KEY = "appSettings";
export const SETTINGS_VERSION = 1;

export const DEFAULT_APP_SETTINGS: AppSettings = {
  version: SETTINGS_VERSION,
  defaultBranch: "main",
  hostOverrides: []
};

export interface ResolvedHostSettings {
  host: string;
  defaultRepo: string | undefined;
  baseFolder: string | undefined;
  defaultExtension: string | undefined;
}

export type PublicAppSettings = Omit<AppSettings, "githubToken">;

export function normalizeHost(host: string): string {
  return host.trim().toLowerCase();
}

export function mergeSettings(
  current: AppSettings,
  patch: Partial<Omit<AppSettings, "version">>
): AppSettings {
  return {
    ...current,
    ...patch,
    version: SETTINGS_VERSION,
    hostOverrides: patch.hostOverrides ?? current.hostOverrides
  };
}

export function upsertHostOverride(overrides: HostOverride[], incoming: HostOverride): HostOverride[] {
  const normalizedHost = normalizeHost(incoming.host);
  const normalizedIncoming: HostOverride = {
    host: normalizedHost,
    ...(incoming.defaultRepo ? { defaultRepo: incoming.defaultRepo } : {}),
    ...(incoming.baseFolder ? { baseFolder: incoming.baseFolder } : {}),
    ...(incoming.defaultExtension ? { defaultExtension: incoming.defaultExtension } : {})
  };

  const existingIndex = overrides.findIndex((item) => normalizeHost(item.host) === normalizedHost);

  if (existingIndex < 0) {
    return [...overrides, normalizedIncoming];
  }

  const next = [...overrides];
  next[existingIndex] = {
    ...next[existingIndex],
    ...normalizedIncoming
  };
  return next;
}

export function resolveHostSettings(settings: AppSettings, host: string): ResolvedHostSettings {
  const normalizedHost = normalizeHost(host);
  const override = settings.hostOverrides.find((item) => normalizeHost(item.host) === normalizedHost);

  return {
    host: normalizedHost,
    defaultRepo: override?.defaultRepo ?? settings.defaultRepo,
    baseFolder: override?.baseFolder,
    defaultExtension: override?.defaultExtension
  };
}

export function toPublicSettings(settings: AppSettings): PublicAppSettings {
  const publicSettings: Partial<AppSettings> = { ...settings };
  delete publicSettings.githubToken;
  return publicSettings as PublicAppSettings;
}
