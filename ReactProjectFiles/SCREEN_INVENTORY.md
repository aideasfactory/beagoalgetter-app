# Screen Inventory & Quick Reference

## Complete List of Screens to Convert

### ✅ Priority 1: Auth Flow (START HERE)

#### 1. Onboarding Screen
- **React File:** `src/components/Onboarding.tsx`
- **RN Target:** `app/onboarding.tsx` + `components/Onboarding.tsx`
- **Status:** Partially exists, needs enhancement
- **Key Features:**
  - 3 slides with full-screen images
  - Icon boxes with colored backgrounds
  - Animated progress dots
  - "Next" → "Get Started" button
  - "Already have account? Log in" link
- **Complexity:** ⭐⭐ Medium

#### 2. Login Screen
- **React File:** `src/components/Login.tsx` (isSignup=false)
- **RN Target:** `app/login.tsx` + `components/AuthScreen.tsx`
- **Status:** Exists, needs enhancement
- **Key Features:**
  - Full-screen background image with gradient
  - Social auth: Google, Email/Magic Link, Apple
  - Email/password form
  - Show/hide password toggle
  - "Forgot password?" link
  - Toggle to signup
- **Complexity:** ⭐⭐⭐ Medium-High

#### 3. Signup Screen
- **React File:** `src/components/Login.tsx` (isSignup=true)
- **RN Target:** `app/signup.tsx` + `components/AuthScreen.tsx`
- **Status:** Exists, needs enhancement
- **Key Features:**
  - Same as login + name field
  - Terms & Privacy links
- **Complexity:** ⭐⭐⭐ Medium-High

---

### Priority 2: Main App Screens

#### 4. Home Feed / HomePage
- **React File:** `src/components/HomePage.tsx`
- **RN Target:** `app/(tabs)/index.tsx`
- **Status:** Needs creation
- **Key Features:**
  - Top nav with logo and notification bell
  - Tab filter: "All" vs "My Challenges"
  - Feed of post cards
  - Post card elements:
    - User avatar, name, streak badge
    - Challenge name (clickable)
    - Success/Fail ribbon (corner)
    - Post message, note, image
    - Like button, Give Points button
    - Ability points indicator
  - Group banner for group challenges
  - 4 Bottom Sheets:
    1. Notifications
    2. Challenge preview
    3. Give points
    4. Group info
- **Components to Create:**
  - `components/PostCard.tsx`
  - `components/NotificationBell.tsx`
  - `components/NotificationsModal.tsx`
  - `components/ChallengePreviewModal.tsx`
  - `components/GivePointsModal.tsx`
  - `components/GroupInfoModal.tsx`
- **Complexity:** ⭐⭐⭐⭐⭐ Very High (most complex screen)

#### 5. Challenge List
- **React File:** `src/components/ChallengeList.tsx`
- **RN Target:** `app/(tabs)/challenges.tsx`
- **Status:** Needs creation
- **Key Features:**
  - Search bar
  - Filter buttons: All, Personal, Team, Group
  - 2-column grid of challenge cards
  - Floating "+" button (create challenge)
  - Challenge card shows:
    - Image
    - Title, description
    - Type badge
    - Stats (members, days, completion %)
    - Progress indicator
- **Components to Create:**
  - `components/ChallengeCard.tsx`
- **Complexity:** ⭐⭐⭐ Medium-High

#### 6. Profile Screen
- **React File:** `src/components/Profile.tsx`
- **RN Target:** `app/(tabs)/profile.tsx`
- **Status:** Needs creation
- **Key Features:**
  - User avatar (editable)
  - Name, username, bio
  - 3 stats cards: Streaks, Ability Points, Challenges Completed
  - Recent activity feed
  - Settings button
- **Complexity:** ⭐⭐ Medium

---

### Priority 3: Challenge Screens

#### 7. Challenge Details
- **React File:** `src/components/ChallengeDetails.tsx`
- **RN Target:** `app/challenge/[id].tsx`
- **Status:** Needs creation
- **Key Features:**
  - Header with image, title, type badge, stats
  - 3 Tabs:
    1. **Task Tracker:** Daily checklist with dates, checkboxes, notes
    2. **Leaderboard:** Ranked participants with scores
    3. **Messages:** Team chat/comments
  - Action buttons: "Mark Complete" / "Admit Failure"
- **Components to Create:**
  - `components/challenge-tabs/TaskTrackerTab.tsx`
  - `components/challenge-tabs/LeaderboardTab.tsx`
  - `components/challenge-tabs/MessagesTab.tsx`
- **Complexity:** ⭐⭐⭐⭐ High

#### 8. Create Challenge (4-Step Wizard)
- **React File:** `src/components/CreateChallenge.tsx` (1139 lines!)
- **RN Target:** `app/challenge/create.tsx`
- **Status:** Needs creation
- **Key Features:**
  - **Step 1: Basics**
    - Title, description, duration
    - Challenge type: Personal/Team/Group
    - Group selection (if Group)
    - Image upload
  - **Step 2: Tasks**
    - Add multiple tasks
    - Task recurring days selection
    - OR upload PDF checklist
    - Attach documents/links per task
  - **Step 3: Invite Participants**
    - Search users
    - Select/unselect users
    - Show user stats
  - **Step 4: Create Teams** (if Team type)
    - Create teams with name/color
    - Assign participants to teams
  - Progress indicator (1/4, 2/4, etc.)
- **Components to Create:**
  - `components/create-challenge/Step1Basics.tsx`
  - `components/create-challenge/Step2Tasks.tsx`
  - `components/create-challenge/Step3InviteUsers.tsx`
  - `components/create-challenge/Step4CreateTeams.tsx`
- **Complexity:** ⭐⭐⭐⭐⭐ Very High (most complex wizard)

#### 9. Settings Page
- **React File:** `src/components/SettingsPage.tsx`
- **RN Target:** `app/settings.tsx`
- **Status:** Needs creation
- **Key Features:**
  - Back button
  - Grouped settings rows:
    - Notifications toggle
    - Privacy toggle
    - Edit Profile
    - Terms & Privacy links
    - Logout button
- **Complexity:** ⭐ Easy

---

## Sub-Components Inventory

### Modals / Bottom Sheets
1. **Notifications Modal** - List of notifications with read/unread states
2. **Challenge Preview Modal** - Quick challenge info with "View" button
3. **Give Points Modal** - Select points (1, 3, 5, 10, 15) to give
4. **Group Info Modal** - Group description, stats, members

### Cards & Lists
1. **PostCard** - Social feed post card with all features
2. **ChallengeCard** - Grid card for challenge list
3. **UserCard** - User selection card (create challenge Step 3)
4. **TaskCard** - Daily task checklist item
5. **LeaderboardRow** - Ranked participant row
6. **MessageCard** - Chat message bubble

### Form Components (Already Exist)
- ✅ `Button.tsx`
- ✅ `FormInput.tsx`
- ✅ `Avatar.tsx`
- ✅ `Card.tsx`

### To Create
- `Badge.tsx` - Colored badge/pill
- `ProgressBar.tsx` - Linear progress indicator
- `ProgressRing.tsx` - Circular progress indicator
- `Checkbox.tsx` - Custom checkbox
- `Switch.tsx` - Already in RN, just style it
- `SearchBar.tsx` - Search input with icon

---

## Complexity Breakdown

### Easy (⭐)
- Settings Page

### Medium (⭐⭐)
- Onboarding Screen (enhancement)
- Profile Screen

### Medium-High (⭐⭐⭐)
- Login/Signup Screen
- Challenge List Screen

### High (⭐⭐⭐⭐)
- Challenge Details Screen (3 tabs)

### Very High (⭐⭐⭐⭐⭐)
- Home Feed Screen (complex with 4 modals)
- Create Challenge Wizard (4 steps)

---

## Estimated Time per Screen

| Screen | Complexity | Estimated Time |
|--------|-----------|---------------|
| Onboarding | ⭐⭐ | 2-3 hours |
| Login/Signup | ⭐⭐⭐ | 3-4 hours |
| Home Feed | ⭐⭐⭐⭐⭐ | 8-12 hours |
| Challenge List | ⭐⭐⭐ | 3-4 hours |
| Profile | ⭐⭐ | 2-3 hours |
| Challenge Details | ⭐⭐⭐⭐ | 6-8 hours |
| Create Challenge | ⭐⭐⭐⭐⭐ | 10-15 hours |
| Settings | ⭐ | 1-2 hours |
| **Total** | | **35-51 hours** |

---

## Conversion Order (Recommended)

### Week 1: Foundation
1. ✅ Enhance Onboarding Screen (2-3h)
2. ✅ Enhance Login/Signup Screens (3-4h)
3. ✅ Create database tables in Supabase (2h)
4. ✅ Test auth flows (1h)
5. ✅ Create bottom tab navigation (1h)
6. ✅ Create reusable components (Badge, ProgressBar, etc.) (3-4h)

### Week 2: Core Screens
7. Profile Screen (2-3h)
8. Challenge List Screen + ChallengeCard (3-4h)
9. Settings Screen (1-2h)

### Week 3: Complex Screens
10. Home Feed Screen (8-12h)
    - Create PostCard first
    - Then add modals one by one

### Week 4: Challenge Features
11. Challenge Details Screen (6-8h)
    - Create tab components separately
12. Create Challenge Wizard (10-15h)
    - Build step-by-step, test each step

### Week 5: Polish & Testing
13. Add animations
14. Test all flows
15. Fix bugs
16. Optimize performance

---

## Data Models Reference

### Tables Needed in Supabase

1. **challenges** - Challenge metadata
2. **tasks** - Challenge tasks
3. **task_completions** - Task check-ins
4. **challenge_participants** - Who joined which challenge
5. **teams** - Teams within challenges
6. **groups** - Community groups
7. **posts** - Social feed posts
8. **notifications** - User notifications
9. **profiles** - Extended user profiles
10. **messages** - Challenge messages/chat

See `CONVERSION_README.md` for full table schemas.

---

## Quick Reference: Key Colors

| Element | Color |
|---------|-------|
| Primary/Brand | `#00c2ff` (cyan) |
| Background | `#000000` (black) |
| Cards | `#1a1a1a` (dark gray) |
| Text | `#ffffff` with opacity |
| Success | `#00c2ff` |
| Failure | `#ef4444` (red) |
| Borders | `#ffffff10`, `#ffffff20` |

---

## Quick Reference: Icon Mapping

| React (lucide-react) | React Native (Ionicons) |
|---------------------|------------------------|
| `Home` | `home` |
| `Trophy` | `trophy` |
| `User` | `person` |
| `Bell` | `notifications-outline` |
| `Heart` | `heart-outline` |
| `Award` | `trophy-outline` |
| `TrendingUp` | `trending-up` |
| `Target` | `target` |
| `Users` | `people` |
| `Settings` | `settings-outline` |
| `ArrowLeft` | `arrow-back` |
| `ArrowRight` | `arrow-forward` |
| `Plus` | `add` |
| `Search` | `search` |
| `Mail` | `mail` |
| `Lock` | `lock-closed` |
| `Eye` / `EyeOff` | `eye` / `eye-off` |

---

## Tips for AI Agents

1. **Start small:** Convert one screen at a time, test thoroughly before moving on
2. **Reuse components:** Don't recreate what already exists (Button, FormInput, etc.)
3. **Follow patterns:** Look at existing RN screens for patterns (e.g., existing `Onboarding.tsx`)
4. **Use mock data first:** Hard-code data, then replace with Supabase queries
5. **Test on device:** Use Expo Go or development build to test on real device
6. **Commit often:** Commit after each screen completion
7. **Ask for clarification:** If React code is unclear, refer to `CONVERSION_README.md`

---

## Questions During Conversion?

Refer to these files:
- **Project Overview:** `CONVERSION_README.md`
- **Step-by-Step Instructions:** `AGENT_INSTRUCTIONS.md`
- **This File:** Quick reference for what to build

Good luck! 🎯
