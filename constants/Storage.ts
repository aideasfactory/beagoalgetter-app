export const STORAGE_KEYS = {
  USER_PROFILE: 'userProfile',
  SETTINGS: 'appSettings',
  HAS_LAUNCHED: 'hasLaunched',
} as const;

export type StorageKeys = keyof typeof STORAGE_KEYS;
