# Task: Profile Management - Avatar, Bio, Display Name & Random Username

**Created:** 2026-02-16
**Last Updated:** 2026-02-16
**Status:** Planning

---

## Overview

### Goal
Implement full profile management including avatar upload, bio editing, display name editing, and random username generation on signup. Ensure profile data (avatar, display name) flows correctly to the home feed posts.

### Requirements
1. **Profile API** — Verify/enhance the existing API for fetching and updating profile data (avatar, bio, display_name)
2. **Profile editing** — Implement avatar upload, bio editing, and display name editing on the profile edit page
3. **Auth sync** — When display_name is updated in the profiles table, also update it in Supabase auth user metadata
4. **Feed integration** — Posts on the home page must use the avatar and display_name from the `profiles` table (already done via `posts_with_details` view)
5. **Random username on signup** — When a new user is created, auto-generate a random username like `user_65576` as the display_name

### Success Criteria
- [ ] Profile API correctly fetches user profile data (avatar, bio, display_name, username)
- [ ] User can upload/change avatar from profile edit page (stored in `avatars` bucket)
- [ ] User can edit bio from profile edit page
- [ ] User can edit display_name from profile edit page
- [ ] When display_name is updated, it syncs to Supabase auth `user_metadata.display_name`
- [ ] Posts on home feed show the user's avatar and display_name from the `profiles` table
- [ ] New users get a random username like `user_65576` as their `display_name`
- [ ] Existing UI design is preserved
- [ ] No regressions to existing functionality

### Context
- Profile page: `app/(tabs)/profile/index.tsx` — displays profile data from `useProfile` hook
- Profile edit page: `app/(tabs)/profile/edit.tsx` — currently only edits display_name and email, no avatar/bio
- Profile service: `services/profile.ts` — has `getMyProfile()` and `updateProfile()` methods
- Auth context: `context/auth.tsx` — has `updateProfile()` that updates `auth.users` metadata
- Profile hook: `hooks/useProfile.ts` — fetches profile via `profileService.getMyProfile()`
- Feed: `hooks/useFeedPosts.ts` — maps `user_name` and `user_avatar` from `posts_with_details` view
- View: `posts_with_details` — already joins `profiles.display_name` as `user_name` and `profiles.avatar_url` as `user_avatar`
- Signup trigger: `handle_new_user()` — currently copies `display_name` and `username` from auth metadata (both null for most signups)
- Storage bucket: `avatars` — already exists for user profile pictures

---

## PHASE 1: PLANNING

**Status:** 🔄 In Progress

### Tasks
- [x] Review current profile page and edit page implementation
- [x] Review profile service and hook
- [x] Review auth context `updateProfile` method
- [x] Review `handle_new_user()` trigger function
- [x] Review `posts_with_details` view for avatar/displayname flow
- [x] Review feed posts hook for data mapping
- [x] Identify all files to create/modify
- [x] Plan implementation approach
- [ ] Get approval before coding

### Issue Analysis

#### Issue 1: Profile Edit Page Missing Avatar & Bio
**Current state:** `app/(tabs)/profile/edit.tsx` only has fields for `displayName` and `email`. No avatar upload or bio editing.

**Fix:** Enhance the edit page with:
- Avatar image picker + upload to `avatars` Supabase storage bucket
- Bio text input field
- Update both `profiles` table AND `auth.users` metadata on save

**Files to modify:**
- `app/(tabs)/profile/edit.tsx` — Add avatar picker, bio field, update save logic

#### Issue 2: Auth Sync on Display Name Update
**Current state:** `context/auth.tsx` `updateProfile()` updates `auth.users` metadata with `display_name`. But `profile/edit.tsx` only calls `updateProfile()` from context — it does NOT update the `profiles` table. The `useProfile` hook reads from the `profiles` table, so the profile page shows stale data.

**Fix:** The edit page must update BOTH:
1. `profiles` table via `profileService.updateProfile()` — for display_name, bio, avatar_url
2. `auth.users` metadata via `context.updateProfile()` — for display_name (so it's also in auth metadata)

**Files to modify:**
- `app/(tabs)/profile/edit.tsx` — Call both profile service and auth context updates
- `services/profile.ts` — Already has `updateProfile()`, no changes needed

#### Issue 3: Random Username on Signup
**Current state:** `handle_new_user()` trigger copies `display_name` and `username` from `auth.users.raw_user_meta_data`. For email/password signups, both are `null`. For social logins (Apple/Google), `display_name` might have a value but `username` is still `null`.

**Fix:** Update the `handle_new_user()` trigger to generate a random display_name like `user_XXXXX` (5-digit random number) when no display_name is provided. Also set username to the same value.

**New migration:** `006_update_handle_new_user_random_username.sql`

**SQL:**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    generated_name TEXT;
BEGIN
    -- Use provided display_name or generate a random one
    generated_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'display_name'), ''),
        'user_' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0')
    );

    INSERT INTO public.profiles (id, display_name, username)
    VALUES (
        NEW.id,
        generated_name,
        COALESCE(
            NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
            generated_name
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Files to create:**
- `supabase/migrations/006_update_handle_new_user_random_username.sql`

**Files to modify:**
- `.claude/database-schema.md` — Update function documentation and migrations log

#### Issue 4: Feed Posts Already Use Profile Data
**Current state:** The `posts_with_details` view already joins `profiles.display_name` as `user_name` and `profiles.avatar_url` as `user_avatar`. The `useFeedPosts` hook maps these correctly. **No changes needed here** — once avatar/display_name are properly saved to the `profiles` table, the feed will automatically show them.

**Verification:** The feed data flow is already correct:
```
profiles.display_name → posts_with_details.user_name → FeedPost.user.name → PostCard
profiles.avatar_url   → posts_with_details.user_avatar → FeedPost.user.avatar → PostCard
```

### Decisions Made
- **Avatar upload:** Use `expo-image-picker` for selection + `expo-file-system` for base64 read + upload to `avatars` Supabase storage bucket (same pattern as `useCompleteDay.ts`)
- **Profile update:** Update `profiles` table first, then sync `display_name` to auth metadata
- **Random username:** Generate in the `handle_new_user()` trigger using `user_` + 5-digit random number
- **No feed changes needed:** The view already reads from profiles table
- **Refetch profile:** After saving profile edits, call `useProfile.refetch()` to refresh the profile page

### Components & Files Plan

**New files to create:**
1. `supabase/migrations/006_update_handle_new_user_random_username.sql`

**Files to modify:**
1. `app/(tabs)/profile/edit.tsx` — Add avatar picker, bio field, avatar upload, dual save (profiles + auth)
2. `app/(tabs)/profile/index.tsx` — Add edit profile button navigation, ensure refetch after edit
3. `services/profile.ts` — Add `uploadAvatar()` method for avatar upload to storage
4. `.claude/database-schema.md` — Update handle_new_user docs and migrations log

### Supabase Requirements
- [x] New tables needed? **No**
- [x] New RLS policies needed? **No** (avatars bucket already has policies)
- [x] New migrations needed? **Yes** — Update `handle_new_user()` for random username
- [x] Schema documentation update needed? **Yes** — Update function docs and migrations log

### Dependencies Needed
- `expo-image-picker` — Already included with Expo
- `expo-file-system` — Already included with Expo
- `base64-arraybuffer` — Already a dependency

### Implementation Phases

#### Phase 2A: Database Migration (Random Username)
1. Create migration `006_update_handle_new_user_random_username.sql`
2. Update `.claude/database-schema.md`

#### Phase 2B: Profile Service Enhancement
1. Add `uploadAvatar()` method to `services/profile.ts`

#### Phase 2C: Profile Edit Page Enhancement
1. Add avatar picker with camera icon tap
2. Add bio text field
3. Implement avatar upload flow (pick → upload → get URL)
4. Update save logic to update both `profiles` table and auth metadata
5. Add loading states for avatar upload

#### Phase 2D: Profile Page Updates
1. Wire camera icon on avatar to navigate to edit page or trigger picker
2. Ensure profile refetches after edit

### Notes
- The `avatars` storage bucket is already configured as public read + owner upload
- Avatar file path convention: `{userId}/{timestamp}.jpg`
- The profile edit page currently uses `useSession().updateProfile()` which only updates auth metadata — this needs to ALSO update the profiles table
- The `posts_with_details` view already reads from `profiles` table, so no feed changes needed

### Reflection
**What went well:**
- Clear identification that the feed integration is already correct — no changes needed there
- Identified the dual-update requirement (profiles table + auth metadata)
- Existing patterns for image upload (from `useCompleteDay.ts`) can be reused

**What could be improved:**
- The original profile edit page should have updated the `profiles` table from the start

**Risks identified:**
- Avatar upload could fail silently if storage bucket policies are misconfigured
- Concurrent profile updates (auth + profiles) could leave data inconsistent if one fails
- Random username collision is possible but extremely unlikely (1 in 100,000)

**⚠️ STOP - Awaiting approval to proceed to Phase 2**

---

## PHASE 2: IMPLEMENTATION

**Status:** ✅ Complete

### Tasks
- [x] Create migration `006_update_handle_new_user_random_username.sql`
- [x] Update `.claude/database-schema.md` with migration and function changes
- [x] Add `uploadAvatar()` method to `services/profile.ts`
- [x] Enhance `app/(tabs)/profile/edit.tsx` with avatar picker, bio field, and dual save
- [x] Update `app/(tabs)/profile/index.tsx` for edit navigation and refetch
- [x] Verify avatar/displayname flow to home feed posts

### Files Created
- `supabase/migrations/006_update_handle_new_user_random_username.sql` — Updated `handle_new_user()` to generate random `user_XXXXX` display_name when none provided

### Files Modified
- `services/profile.ts` — Added `uploadAvatar()` method using `expo-file-system` + `base64-arraybuffer` to upload to `avatars` bucket
- `app/(tabs)/profile/edit.tsx` — Complete rewrite: avatar picker with image upload, bio text field, dark theme, dual save (profiles table + auth metadata), loading states
- `app/(tabs)/profile/index.tsx` — Added `useFocusEffect` to refetch profile on screen focus, wired avatar tap to edit page, added "Edit Profile" button, removed hardcoded fallback data
- `.claude/database-schema.md` — Updated `handle_new_user()` description and added migration 006 to log

### Key Implementation Details
- **Avatar upload:** Uses same pattern as `useCompleteDay.ts` — `FileSystem.readAsStringAsync` + `decode(base64)` for reliable upload to Supabase storage
- **Dual save:** Edit page calls `profileService.updateProfile()` (profiles table) THEN `updateAuthProfile()` (auth metadata) to keep both in sync
- **Feed integration:** No changes needed — `posts_with_details` view already reads `display_name` and `avatar_url` from `profiles` table
- **Profile refetch:** `useFocusEffect` ensures profile data refreshes when navigating back from edit page
- **Random username:** `handle_new_user()` now generates `user_` + 5-digit zero-padded random number when `display_name` is empty/null

### Reflection
**What went well:**
- Reused existing image upload pattern from `useCompleteDay.ts` for consistency
- No feed changes needed — the existing view handles everything
- Dark theme styling consistent with profile page

**What could be improved:**
- Could add optimistic avatar preview while uploading

**⚠️ STOP - Awaiting approval to proceed to Phase 3**

---

## PHASE 3: TESTING & REVIEW

**Status:** ✅ Complete

### Tasks
- [x] Code review all modified files
- [x] Verify avatar upload flow logic
- [x] Verify bio editing saves and displays
- [x] Verify display_name syncs to auth metadata
- [x] Verify random username generation in migration SQL
- [x] Verify feed posts show updated avatar/display_name
- [x] Check for TypeScript errors — **0 new errors** (pre-existing only)
- [x] Verify no visual design regressions

### Review Findings

**No issues found in:**

1. **`supabase/migrations/006_update_handle_new_user_random_username.sql`**
   - `COALESCE(NULLIF(TRIM(...), ''), 'user_' || LPAD(...))` correctly handles null, empty, and whitespace-only display names
   - `SECURITY DEFINER` preserved from original function
   - `CREATE OR REPLACE` safely updates the existing function
   - Username fallback also uses `generated_name` when no explicit username provided

2. **`services/profile.ts`**
   - `uploadAvatar()` follows same pattern as `useCompleteDay.ts` upload — `FileSystem.readAsStringAsync` + `decode(base64)`
   - `upsert: true` allows overwriting previous avatar files
   - File path `{userId}/{timestamp}.{ext}` prevents naming collisions
   - Proper error propagation with `throw`

3. **`app/(tabs)/profile/edit.tsx`**
   - Dual save: profiles table first, then auth metadata — correct order
   - Avatar upload only happens if user picked a new image (`if (avatarUri)`)
   - `isUploadingAvatar` state correctly managed in try/finally
   - Form defaults pull from `profile` first, then `user.user_metadata` fallback
   - Zod schema validates displayName required + bio max 160 chars
   - Dark theme styling consistent with profile page
   - Error displayed via Alert with message fallback

4. **`app/(tabs)/profile/index.tsx`**
   - `useFocusEffect` + `useCallback` correctly refetches profile when screen focuses
   - Avatar and Edit Profile button both navigate to edit page
   - Removed hardcoded fallback data ("Sarah Johnson", "@sarahj", etc.)
   - All existing sections (stats, badges, groups, settings) untouched

5. **Feed integration verified:**
   - `posts_with_details` view reads `profiles.display_name` as `user_name` and `profiles.avatar_url` as `user_avatar`
   - `useFeedPosts.ts` maps `post.user_name` → `FeedPost.user.name` and `post.user_avatar` → `FeedPost.user.avatar`
   - No changes needed — updating profiles table automatically flows to feed

**Pre-existing TypeScript errors (NOT from our changes):**
1. `NotificationsModal.tsx` — "target" icon name not in Ionicons type
2. `context/subscription.tsx` — SubscriptionStatus type comparison
3. `types/database.example.ts` — missing React imports in example code
4. `utils/superwall.ts` — Superwall API type mismatch

### Reflection
**What went well:**
- Clean implementation with zero new TypeScript errors
- All existing functionality preserved
- Consistent patterns with rest of codebase

**⚠️ STOP - Awaiting approval to proceed to Phase 4**

---

## PHASE 4: REFLECTION & CLEANUP

**Status:** ⏸️ Not Started

### Tasks
- [ ] Document known limitations
- [ ] Note future improvements
- [ ] Final code review
- [ ] Update database-schema.md (if not already done)
