# Task: Push Notification System

**Created:** 2026-03-08
**Last Updated:** 2026-03-08
**Status:** Planning

---

## Overview

### Goal
Implement a complete push notification system for Goal Getter that includes:
1. Native device push notifications via Expo Push Notifications
2. In-app notification list/history area
3. Admin UI for composing and sending broadcast push notifications
4. Deep linking from notifications to relevant app sections
5. Push token persistence to Supabase

### Success Criteria
- [ ] Push tokens saved to `profiles.push_token` in Supabase on app launch
- [ ] New `notification_type` enum value 'admin' for broadcast notifications
- [ ] `notifications` table supports title + deep link data for admin notifications
- [ ] `push_notification_campaigns` table tracks sent broadcasts
- [ ] Push notification service sends via Expo Push API and creates in-app notification records
- [ ] Admin screen to compose and send push notifications (title, body, optional deep link)
- [ ] Campaign history visible on admin screen
- [ ] Tapping a push notification deep links to the correct app screen
- [ ] NotificationsModal enhanced: admin notifications show title+body, tap to deep link, mark as read on tap, "Mark all read" button
- [ ] Database schema documentation updated
- [ ] No regressions to existing functionality

### Context
- **Existing infrastructure:** `expo-notifications` installed, `registerForPushNotificationsAsync()` retrieves Expo push token, `sendPushNotification()` test function exists, `notifications` table/view/service/hook all exist, `NotificationsModal` renders notification list from real DB data
- **Key gap:** Push token is retrieved but never saved to `profiles.push_token`. No server-side push delivery. No admin UI. No deep linking. Notification listeners are empty stubs.
- **Existing notification_type enum:** `'like' | 'points' | 'challenge' | 'streak'` — needs `'admin'`
- **Profiles table** already has `push_token` (TEXT) and `device` (TEXT, CHECK ios/android) columns — ready for use

---

## PHASE 1: PLANNING

**Status:** 🔄 In Progress

### Tasks
- [x] Review requirements
- [x] Review existing notification infrastructure (Notifications.ts, useNotifications, useUserNotifications, notificationService, NotificationsModal, home screen integration)
- [x] Review database schema (notifications table, notification_type enum, profiles.push_token)
- [x] Identify database gaps
- [x] Plan migration changes
- [x] Identify all files to create/modify
- [x] Plan implementation approach
- [x] Define implementation phases

### Database Analysis

#### What Already Exists
| Component | Status | Notes |
|-----------|--------|-------|
| `notifications` table | ✅ Ready | id, user_id, type, message, from_user_id, post_id, read, created_at |
| `notifications_with_users` view | ✅ Ready | Joins sender profile info |
| `notification_type` enum | ⚠️ Needs extension | Only has: like, points, challenge, streak — needs 'admin' |
| `profiles.push_token` | ✅ Column exists | TEXT, nullable — but never written to |
| `profiles.device` | ✅ Column exists | CHECK IN ('ios', 'android') — never written to |
| `notificationService` | ✅ Ready | getNotifications, getUnreadCount, markAsRead, markAllAsRead |
| `useNotifications` hook | ⚠️ Incomplete | Retrieves push token but doesn't save to DB. Notification listeners are empty. |
| `useUserNotifications` hook | ✅ Ready | Fetches notifications, mark read, mark all read |
| `NotificationsModal` | ⚠️ Needs enhancement | No support for admin notification type, no deep linking, no title display, no mark-read-on-tap |
| `expo-notifications` | ✅ Installed | v0.31.3, handler configured in tabs layout |
| `Notifications.ts` | ✅ Ready | registerForPushNotificationsAsync(), sendPushNotification() |

#### What's Missing
| Component | Needed For |
|-----------|-----------|
| `'admin'` value in notification_type enum | Broadcast notifications |
| `title` column on notifications | Push notification title display |
| `data` JSONB column on notifications | Deep link data (screen, entity ID) |
| `push_notification_campaigns` table | Track admin broadcast history |
| Push token persistence | Saving tokens to profiles.push_token |
| Push notification send service | Batch-send via Expo Push API |
| Admin UI screen | Compose and send notifications |
| Deep link handler | Navigate on notification tap |
| Enhanced NotificationsModal | Title, deep link, mark-read-on-tap |

### Migration Plan

#### Migration 014: Push notification support

**File:** `supabase/migrations/014_push_notification_support.sql`

**Change 1: Add 'admin' to notification_type enum**
```sql
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'admin';
```

**Change 2: Add title and data columns to notifications**
```sql
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';
```

**Change 3: Create push_notification_campaigns table**
```sql
CREATE TABLE push_notification_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE push_notification_campaigns ENABLE ROW LEVEL SECURITY;
```

**Change 4: Update notifications_with_users view**
Add `title` and `data` fields to the view.

**Change 5: RLS policies for push_notification_campaigns**
- Authenticated users can view campaigns they sent (SELECT where sent_by = auth.uid)
- Authenticated users can create campaigns (INSERT)

### Files Plan

**New files to create:**
1. `supabase/migrations/014_push_notification_support.sql` — DB migration
2. `services/pushNotification.ts` — Send push notifications via Expo API + create notification records
3. `app/admin/send-notification.tsx` — Admin screen to compose/send push notifications
4. `app/admin/_layout.tsx` — Admin routes layout with Stack navigator

**Files to modify:**
1. `hooks/useNotifications.ts` — Save push token to profiles.push_token + deep link handler on notification tap
2. `services/notification.ts` — Add createNotification method for admin notifications
3. `services/index.ts` — Export new pushNotification service
4. `types/database.example.ts` — Add PushNotificationCampaign type, update NotificationType, update NotificationWithUser
5. `components/NotificationsModal.tsx` — Support admin notifications, title display, tap-to-deep-link, mark-read-on-tap, mark-all-read button
6. `app/(tabs)/index.tsx` — Pass markAsRead/markAllAsRead to NotificationsModal
7. `app/(tabs)/profile/settings.tsx` — Add "Send Notification" admin button
8. `.claude/database-schema.md` — Update documentation

### Push Notification Architecture

**Sending flow (admin broadcast):**
1. Admin opens Send Notification screen from settings
2. Fills in title, body, selects optional deep link target (challenge, general)
3. Taps "Send to All Users"
4. `pushNotificationService.sendBroadcast()`:
   a. Creates campaign record in `push_notification_campaigns`
   b. Fetches all profiles with non-null `push_token`
   c. Sends push notifications via Expo Push API in chunks of 100
   d. Creates `notifications` rows for each user (type='admin', title, body as message, data for deep link)
   e. Updates campaign `recipient_count`

**Receiving flow:**
1. Device receives push → shows native notification banner (handled by Expo notification handler)
2. User taps push notification → `addNotificationResponseReceivedListener` fires → extracts `data` → navigates via `router.push()`
3. User opens NotificationsModal → sees admin notification with title + body + deep link indicator
4. Taps notification in list → marks as read + navigates to deep link target

**Deep link data structure:**
```json
{
  "screen": "challenge",
  "id": "uuid-here"
}
```
Supported screens: `challenge` → `/challenge/{id}`, `home` → `/`, `profile` → `/profile`, none → no navigation

### Supabase Requirements
- [x] New tables needed? **Yes** — `push_notification_campaigns`
- [x] New RLS policies needed? **Yes** — for campaigns table
- [x] New migrations needed? **Yes** — migration 014
- [x] Schema documentation update needed? **Yes** — new table + modified notifications table

### Dependencies Needed
- None — `expo-notifications` and `expo-device` already installed

### Decisions Made
- **Client-side push delivery:** Admin UI sends directly via Expo Push API from the mobile client. Simpler than Edge Functions for MVP. Can be migrated to server-side later.
- **Admin access:** Initially available to all authenticated users from settings screen. Admin role restriction can be added later via a flag on profiles.
- **Chunk size:** 100 tokens per Expo API request (Expo's recommended limit)
- **Campaign tracking:** Separate `push_notification_campaigns` table logs each broadcast for history
- **Deep link structure:** Simple `{ screen, id }` in notification `data` JSONB column
- **No real-time subscription for notifications yet:** Can be added as a future improvement. Current flow: refetch on mount + after mutations.

### Risks Identified
- **Client-side push token reading:** Profiles SELECT is public, so push_token is readable by any authenticated user. Acceptable for MVP; for production, consider column-level security or Edge Function.
- **Expo Push API rate limits:** For very large user bases, batch sending from client could be slow. Edge Function migration addresses this.
- **Notification permission denied:** Some users may deny push permissions — these users still get in-app notifications but not native push.
- **Deep link target may not exist:** A challenge could be deleted after notification was sent. Need graceful handling.

### Reflection
**What went well:**
- Existing infrastructure is solid — push token retrieval, notification table, service/hook layer, and UI all exist
- Just need to connect the dots: save tokens, add admin type, build send service, add deep linking

**What could be improved:**
- Push token was retrieved but never persisted — this should have been done in the initial notification setup
- Notification listeners were left as empty stubs — should have been scaffolded with TODO comments

**→ Phase complete. Proceed immediately to the next phase.**

---

## PHASE 2: DATABASE MIGRATION

**Status:** ⏸️ Not Started

### Tasks
- [ ] Create migration `014_push_notification_support.sql`
  - [ ] Add 'admin' value to notification_type enum
  - [ ] Add `title` TEXT column to notifications
  - [ ] Add `data` JSONB column to notifications
  - [ ] Create `push_notification_campaigns` table with RLS
  - [ ] Update `notifications_with_users` view to include title + data
- [ ] Update `.claude/database-schema.md`
  - [ ] Document notifications table changes (title, data columns)
  - [ ] Document push_notification_campaigns table
  - [ ] Update notification_type enum values
  - [ ] Add migration 014 to log
  - [ ] Update ERD if needed

### Currently Working On
[Updated as you work through the phase]

### Files Created
-

### Files Modified
-

### Implementation Details
[Key decisions, patterns used, issues encountered]

### Notes
-

### Reflection
**What went well:**
-

**What could be improved:**
-

**→ Phase complete. Proceed immediately to the next phase.**

---

## PHASE 3: PUSH TOKEN PERSISTENCE & SERVICE LAYER

**Status:** ⏸️ Not Started

### Tasks
- [ ] Update `hooks/useNotifications.ts`
  - [ ] After retrieving push token, save to `profiles.push_token` via Supabase update
  - [ ] Also save device platform to `profiles.device`
  - [ ] Only update if token changed (avoid unnecessary writes)
- [ ] Create `services/pushNotification.ts`
  - [ ] `sendBroadcast(title, body, data?)` — main broadcast function
  - [ ] Fetch all profiles with non-null push_token
  - [ ] Chunk tokens into batches of 100
  - [ ] Send via Expo Push API (`https://exp.host/--/api/v2/push/send`)
  - [ ] Create notification records in `notifications` table for each user
  - [ ] Create campaign record in `push_notification_campaigns`
  - [ ] Return campaign summary (recipient count, success/fail)
- [ ] Update `services/notification.ts`
  - [ ] Add `createNotification()` method for programmatic notification creation
- [ ] Update `types/database.example.ts`
  - [ ] Add `PushNotificationCampaign` interface
  - [ ] Update `NotificationType` to include 'admin'
  - [ ] Update `Notification` interface with `title` and `data` fields
  - [ ] Update `NotificationWithUser` with `title` and `data` fields
- [ ] Update `services/index.ts` — export pushNotificationService

### Currently Working On
[Updated as you work through the phase]

### Files Created
-

### Files Modified
-

### Implementation Details
[Key decisions, patterns used, issues encountered]

### Notes
-

### Reflection
**What went well:**
-

**What could be improved:**
-

**→ Phase complete. Proceed immediately to the next phase.**

---

## PHASE 4: DEEP LINKING & NOTIFICATION RESPONSE HANDLING

**Status:** ⏸️ Not Started

### Tasks
- [ ] Update `hooks/useNotifications.ts`
  - [ ] Implement `addNotificationResponseReceivedListener` — extract `data` from notification response
  - [ ] Parse deep link data: `{ screen, id }`
  - [ ] Navigate via `router.push()` based on screen type:
    - `challenge` → `/challenge/{id}`
    - `home` → `/`
    - `profile` → `/profile`
    - default → no navigation (just open app)
  - [ ] Implement `addNotificationReceivedListener` — trigger refetch of notifications when a push is received while app is open
- [ ] Update Expo notification handler in `app/(tabs)/_layout.tsx`
  - [ ] Enable `shouldPlaySound: true` for push notifications

### Currently Working On
[Updated as you work through the phase]

### Files Created
-

### Files Modified
-

### Implementation Details
[Key decisions, patterns used, issues encountered]

### Notes
-

### Reflection
**What went well:**
-

**What could be improved:**
-

**→ Phase complete. Proceed immediately to the next phase.**

---

## PHASE 5: ADMIN SEND NOTIFICATION SCREEN

**Status:** ⏸️ Not Started

### Tasks
- [ ] Create `app/admin/_layout.tsx` — Stack navigator for admin routes
- [ ] Create `app/admin/send-notification.tsx` — Admin compose + send screen
  - [ ] Header with back button and title "Send Notification"
  - [ ] Form inputs: Title (required), Body (required)
  - [ ] Optional deep link selector: None / Challenge (pick from list) / Home / Profile
  - [ ] Character count indicators
  - [ ] "Send to All Users" button with confirmation alert
  - [ ] Loading state during send
  - [ ] Success/error feedback
  - [ ] Campaign history section below the form — list of past broadcasts with title, date, recipient count
- [ ] Add navigation to admin screen from `app/(tabs)/profile/settings.tsx`
  - [ ] Add "Send Notification" row that navigates to `/admin/send-notification`
- [ ] Style following app's dark theme + NativeWind patterns

### Admin UI Design Recommendations
- Dark theme matching the app's `bg-black` / `bg-[#1a1a1a]` style
- Cyan accent color (`#00c2ff`) for primary actions
- Simple single-screen layout: compose form at top, campaign history scrollable list below
- Confirmation dialog before sending to prevent accidents
- Toast/alert on success showing "Sent to X users"
- Campaign history cards showing: title, body preview (truncated), date, recipient count badge

### Currently Working On
[Updated as you work through the phase]

### Files Created
-

### Files Modified
-

### Implementation Details
[Key decisions, patterns used, issues encountered]

### Notes
-

### Reflection
**What went well:**
-

**What could be improved:**
-

**→ Phase complete. Proceed immediately to the next phase.**

---

## PHASE 6: ENHANCED NOTIFICATIONS MODAL

**Status:** ⏸️ Not Started

### Tasks
- [ ] Update `components/NotificationsModal.tsx`
  - [ ] Update `Notification` interface to include optional `title` and `data` fields
  - [ ] Render admin notifications with title (bold) + body layout
  - [ ] Use megaphone icon for admin notifications (instead of user avatar)
  - [ ] Add "Mark All Read" button in header
  - [ ] On notification tap: mark as read + deep link if `data.screen` exists
  - [ ] Close modal before navigating to deep link target
  - [ ] Empty state when no notifications
- [ ] Update `app/(tabs)/index.tsx`
  - [ ] Pass `markAsRead` and `markAllAsRead` from `useUserNotifications` to NotificationsModal
  - [ ] Map `title` and `data` fields from DB notification to modal notification
- [ ] Update `hooks/useUserNotifications.ts` if needed
  - [ ] Ensure refetch is called when modal opens (fresh data)

### Currently Working On
[Updated as you work through the phase]

### Files Created
-

### Files Modified
-

### Implementation Details
[Key decisions, patterns used, issues encountered]

### Notes
-

### Reflection
**What went well:**
-

**What could be improved:**
-

**→ Phase complete. Proceed immediately to the next phase.**

---

## PHASE 7: REFLECTION & CLEANUP

**Status:** ⏸️ Not Started

### Tasks
- [ ] Final review of all created/modified files
- [ ] Verify no console.log statements left
- [ ] Verify all TypeScript types are correct
- [ ] Verify database-schema.md is fully updated
- [ ] Document known limitations
- [ ] Note future improvements
- [ ] Write sentinel file

### Currently Working On
[Updated as you work through the phase]

### Notes
-

### Reflection
**What went well:**
-

**What could be improved:**
-

---

## TASK COMPLETE

**Completed:** [Date]

### Final Summary
[Brief 2-3 sentence summary of what was accomplished]

### Known Limitations
-

### Future Improvements
-

### Archive Notes
**Move this file to:** `.claude/tasks/completed/2026-03-08-push-notification-system.md`
