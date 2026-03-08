# EAS Updates — OTA Deployment Workflow

Goal Getter uses [EAS Updates](https://docs.expo.dev/eas-update/introduction/) to deliver over-the-air (OTA) JavaScript updates without requiring app store resubmission.

---

## How It Works

1. **On app launch**, `expo-updates` checks for available updates from EAS servers
2. If an update is found, it **downloads in the background** (the app loads instantly with the cached bundle)
3. Once downloaded, the app **automatically reloads** with the new code
4. Updates can include: JavaScript/TypeScript code, images, text, styles — anything bundled with Metro

**Important:** Updates **cannot** change native code (new native modules, permission changes, etc.). Those require a new app store build.

---

## Update Channels

| Channel | Build Profile | Purpose |
|---------|--------------|---------|
| `production` | `production` | Live app store builds |
| `staging` | `preview` | Internal testing builds |
| `development` | `development`, `development-device` | Development builds |

---

## Publishing Updates

### Quick Commands

```bash
# Production update (app store users)
npm run update:production -- --message "Fix: corrected challenge scoring"

# Staging update (internal testers)
npm run update:staging -- --message "Feature: new leaderboard design"

# Development update (dev team)
npm run update:development -- --message "WIP: testing new feed layout"
```

### Direct EAS CLI

```bash
# Publish to a specific channel
eas update --channel production --message "Description of changes"

# Publish to a specific channel for one platform
eas update --channel production --platform ios --message "iOS-specific fix"

# Publish to a specific branch
eas update --branch main --message "Main branch update"
```

---

## Typical Deployment Flow

### 1. JS-Only Change (OTA Update)
For changes that only affect JavaScript/TypeScript, assets, or styling:

```bash
# 1. Make your changes
# 2. Test locally with dev client
# 3. Publish OTA update
npm run update:staging -- --message "Feature: updated challenge cards"

# 4. Test on staging build
# 5. If good, publish to production
npm run update:production -- --message "Feature: updated challenge cards"
```

### 2. Native Change (New Build Required)
For changes that add/modify native modules, permissions, or native config:

```bash
# 1. Make your changes
# 2. Create new builds
npm run buildIosProd
npm run buildAndroidProd

# 3. Submit to app stores
npm run submitIosProd
# (Android: upload to Google Play Console manually or via eas submit)
```

### How to Know Which Type?
- **OTA-eligible:** Changing screens, components, styles, API calls, text, images, hooks, services
- **Requires new build:** Adding new `expo-*` packages, updating native permissions, changing `app.json` native config, adding native modules

---

## Runtime Version & Compatibility

The app uses `"policy": "fingerprint"` for runtime versioning. This means:

- Expo automatically generates a hash of the native project configuration
- Updates are **only delivered** to builds with a matching runtime version
- If you change native code → the fingerprint changes → old builds won't receive new updates (they'll get updates meant for their fingerprint)
- This prevents crashes from incompatible updates

---

## Monitoring Updates

### EAS Dashboard
View published updates, channels, and deployment status:
```
https://expo.dev/accounts/goalgetter/projects/goal-getter/updates
```

### CLI Commands

```bash
# List recent updates
eas update:list

# View update details
eas update:view <update-id>

# Delete an update (rollback)
eas update:delete --id <update-id>
```

---

## Rollback

If a published update has issues:

```bash
# Option 1: Delete the bad update (users will get the previous good version)
eas update:delete --id <update-id>

# Option 2: Publish a fix
npm run update:production -- --message "Fix: reverted broken change"
```

---

## App Behavior

The `useAppUpdates` hook in `app/_layout.tsx` handles updates automatically:

1. **App opens** → checks EAS servers for updates
2. **Update found** → downloads in background (app remains usable)
3. **Download complete** → app reloads automatically with new code
4. **No update** → app loads normally from cache

Configuration in `app.json`:
- `checkAutomatically: "ON_LOAD"` — checks every app launch
- `fallbackToCacheTimeout: 0` — loads instantly, never blocks on download
- `enabled: true` — updates active in production builds

---

## Best Practices

1. **Always include a descriptive message** with `--message` when publishing
2. **Test on staging first** before publishing to production
3. **Keep updates small** — smaller JS bundles download faster
4. **Don't change native code via OTA** — the fingerprint system prevents this, but be aware
5. **Monitor the EAS dashboard** after publishing production updates
6. **Use clear commit messages** — update messages should describe what changed for end users
