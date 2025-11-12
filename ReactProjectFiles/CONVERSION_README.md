# Goal Getter - React to React Native Conversion Documentation

## Project Overview

**Goal Getter** is a social goal-tracking and challenge management application that helps users create challenges, track daily progress, build streaks, earn ability points, and compete on leaderboards with friends and groups.

**Original:** React web app (Vite + Radix UI + Tailwind CSS)  
**Target:** React Native mobile app (Expo + Expo Router + NativeWind)  
**Backend:** Supabase (already configured in the React Native project)  
**Figma Source:** https://www.figma.com/design/HzQwc6T6CGU3gFWxj4mEWj/Goal-Getter-App-Blueprint---supabase

---

## Current React Project Structure

```
ReactProjectFiles/
├── src/
│   ├── components/
│   │   ├── Onboarding.tsx          # 3-slide onboarding with images
│   │   ├── Login.tsx                # Login/Signup with social auth
│   │   ├── HomePage.tsx             # Main feed with posts, notifications
│   │   ├── ChallengeList.tsx        # Browse all challenges
│   │   ├── ChallengeDetails.tsx     # Challenge with 3 tabs (Tasks, Leaderboard, Messages)
│   │   ├── CreateChallenge.tsx      # Multi-step challenge creation (4 steps)
│   │   ├── Profile.tsx              # User profile with stats
│   │   ├── SettingsPage.tsx         # App settings
│   │   └── ui/                      # 50+ Radix UI components
│   ├── App.tsx                      # Main app with routing logic
│   ├── main.tsx                     # Entry point
│   └── styles/
└── package.json
```

---

## Target React Native Project Structure

```
beagoalgetter/
├── app/                          # Expo Router file-based routing
│   ├── (tabs)/                   # Tab navigator
│   ├── _layout.tsx               # Root layout
│   ├── onboarding.tsx            # Onboarding screen (already exists)
│   ├── initial.tsx               # Initial auth screen
│   ├── login.tsx                 # Login screen (already exists)
│   ├── signup.tsx                # Signup screen (already exists)
│   └── [new screens to add]      # Challenge screens, profile, etc.
├── components/                   # Shared components
│   ├── Button.tsx
│   ├── FormInput.tsx
│   ├── Onboarding.tsx
│   ├── Avatar.tsx
│   └── [components to create]
├── context/
│   └── auth.tsx                  # Supabase auth context (ALREADY CONFIGURED)
├── hooks/
├── services/
├── supabase.ts                   # Supabase client (ALREADY CONFIGURED)
└── package.json
```

---

## Application Features & Screens

### ✅ Priority 1: Onboarding & Auth (START HERE)

#### 1. **Onboarding Screen** (`components/Onboarding.tsx`)
- **Status:** Partially implemented in RN
- **Features:**
  - 3 slides with full-screen images and gradient overlays
  - Each slide has: icon, title, description, progress dots
  - "Next" button that becomes "Get Started" on final slide
  - "Already have an account? Log in" link at bottom
- **Images:**
  - Slide 1: Running/fitness image
  - Slide 2: Gym/training image
  - Slide 3: Team sports image
- **Brand Color:** `#00c2ff` (cyan)

#### 2. **Login/Signup Screen** (`components/Login.tsx`)
- **Status:** Partially implemented in RN (needs enhancement)
- **Features:**
  - Toggle between Login and Signup modes
  - Full-screen background image with gradient overlay
  - Logo at top
  - Social auth buttons: Google, Email/Magic Link, Apple
  - Email/password form with toggle visibility
  - "Forgot password?" link (login only)
  - Name field (signup only)
  - Terms & Privacy links (signup only)
  - Toggle between modes: "Already have an account? Log in"
- **Auth Integration:** USE existing Supabase context (`context/auth.tsx`)
  - `signIn(email, password)`
  - `signUp(email, password)`
  - `signInWithGoogle()`
  - `signInWithApple()`
  - `signInWithMagicLink(email)`
  - `resetPassword(email)`

---

### Priority 2: Main App Screens

#### 3. **HomePage / Feed** (`components/HomePage.tsx`)
- **Features:**
  - Top navigation bar with logo and notification bell (with unread badge)
  - Tab filter: "All" vs "My Challenges"
  - Infinite scrolling feed of posts
  - **Post Card:**
    - User avatar, name, streak badge (🔥 number)
    - Challenge name (clickable to view challenge details)
    - Post message and optional note
    - Optional post image
    - Success/Fail ribbon in top-right corner
    - Actions: Like button, "Give Points" button
    - Ability Points gained indicator
    - Timestamp
  - **Group Banner:** Posts from group challenges show colored banner at top
  - **Bottom Sheets:**
    - Challenge details preview sheet
    - Give Points sheet (select 1, 3, 5, 10, or 15 points)
    - Notifications sheet (list of notifications with unread indicator)
    - Group info sheet (group description, stats, members)
  - **iOS-style bottom navigation** (pill shape, glassmorphism)

#### 4. **Challenge List** (`components/ChallengeList.tsx`)
- **Features:**
  - Search bar at top
  - Filter buttons: All, Personal, Team, Group
  - Grid/list of challenge cards:
    - Challenge image
    - Title and description
    - Type badge (Personal/Team/Group)
    - Stats: members, days, completion %
    - Progress ring/bar
    - Join/View button
  - Floating "+" button to create new challenge

#### 5. **Challenge Details** (`components/ChallengeDetails.tsx`)
- **Features:**
  - Header with challenge image, title, type badge
  - Challenge stats (duration, members, completion)
  - **3 Tabs:**
    - **Task Tracker:** Daily checklist with dates, checkboxes, notes, ability points
    - **Leaderboard:** Ranked list of participants with streak, ability points, completion %
    - **Messages:** Team chat/comments (simple message list)
  - Action buttons: "Mark Complete" / "Admit Failure"

#### 6. **Create Challenge** (`components/CreateChallenge.tsx`)
- **Features:**
  - **4-Step Wizard:**
    - **Step 1: Basics**
      - Title, description, duration, duration type (days/weeks)
      - Challenge type: Personal / Team / Group
      - Group selection (if Group type)
      - Optional challenge image upload
    - **Step 2: Tasks**
      - Add multiple tasks with title, description
      - Toggle: Recurring? Select days of week
      - Optional: Upload PDF checklist instead
      - Attach documents or links per task
    - **Step 3: Invite Participants**
      - Search users by name
      - Select/unselect users
      - Shows user avatar, name, current streak, active challenges
    - **Step 4: Create Teams** (if Team type)
      - Create teams with name and color
      - Assign participants to teams
      - Drag-and-drop or manual assignment
  - Progress indicator (1/4, 2/4, etc.)
  - Back/Next/Create buttons

#### 7. **Profile** (`components/Profile.tsx`)
- **Features:**
  - User avatar (editable)
  - Name, username, bio
  - Stats cards: Total Streaks, Ability Points, Challenges Completed
  - Recent activity feed (posts)
  - "Edit Profile" button
  - "Settings" button
  - Logout button

#### 8. **Settings Page** (`components/SettingsPage.tsx`)
- **Features:**
  - Back button
  - Grouped settings rows:
    - Notifications (toggle)
    - Privacy (toggle)
    - Language selector
    - Theme selector (if dark mode)
    - About (app version)
    - Terms & Privacy links
    - Delete Account
    - Logout

---

## Design System

### Colors
- **Primary (Brand):** `#00c2ff` (cyan)
- **Background:** `#000000` (black)
- **Cards:** `#1a1a1a` (dark gray)
- **Text:** `#ffffff` (white) with opacity variants (`#ffffff60`, `#ffffff40`)
- **Success:** `#00c2ff`
- **Failure:** `#ef4444` (red)
- **Borders:** `#ffffff10`, `#ffffff20`

### Typography
- **Headings:** Bold, white, various sizes (24-32px for H1, 18-20px for H2)
- **Body:** Regular, white with 60-70% opacity, 14-16px
- **Labels:** 12-14px, 40-60% opacity

### Spacing
- Consistent padding: 16px (p-4), 24px (p-6)
- Card spacing: 16px gaps between cards
- Border radius: 12-16px for cards, 24px for buttons, 9999px for pills

### Components Patterns
- **Glassmorphism:** `bg-white/5`, `backdrop-blur-xl`, `border border-white/10`
- **Gradient Overlays:** Linear gradients from transparent to black
- **Badges:** Rounded pills with background colors at 20% opacity
- **Buttons:** Rounded rectangles, cyan primary, white/transparent secondary
- **Bottom Sheets:** Radix UI Sheet (mobile) = React Native Modal or ActionSheet

---

## Component Mapping: Radix UI → React Native

| React (Radix UI)              | React Native Equivalent                                  |
|-------------------------------|----------------------------------------------------------|
| `<Button>`                    | `<TouchableOpacity>` or custom `<Button>` component      |
| `<Input>`                     | `<TextInput>` or custom `<FormInput>` component          |
| `<Textarea>`                  | `<TextInput multiline>`                                  |
| `<Label>`                     | `<Text>` with label styling                              |
| `<Select>`                    | `Picker` from `@react-native-picker/picker` or `Modal`   |
| `<Checkbox>`                  | Custom checkbox component with `Pressable` + state       |
| `<Switch>`                    | `<Switch>` from React Native                             |
| `<Avatar>`                    | Custom `<Avatar>` component (already exists)             |
| `<Badge>`                     | `<View>` with text inside, styled                        |
| `<Card>`                      | `<View>` with shadow/border styling (already exists)     |
| `<Dialog>`                    | `<Modal>` from React Native                              |
| `<Sheet>` (bottom drawer)     | `<Modal>` with `presentationStyle="pageSheet"` or custom |
| `<Tabs>`                      | Custom tab bar with state or `@react-navigation/material-top-tabs` |
| `<ScrollArea>`                | `<ScrollView>`                                           |
| `<Carousel>`                  | `<FlatList>` horizontal with pagination                  |
| `<Accordion>`                 | Custom collapsible component                             |
| `<Tooltip>`                   | `react-native-tooltip` or custom                         |
| `<Popover>`                   | `<Modal>` positioned absolutely                          |
| `<Sonner>` (toast)            | `react-native-toast-message` or custom                   |

---

## Routing & Navigation

### React (App.tsx State-based)
- `currentScreen` state controls which component to render
- Functions like `navigateTo(screen)` change state
- Bottom nav buttons call `navigateTo()`

### React Native (Expo Router)
- **File-based routing:** Each screen is a file in `app/`
- **Navigation:**
  - `router.push('/screen-name')`
  - `router.replace('/screen-name')`
  - `router.back()`
- **Tab Navigator:** `app/(tabs)/_layout.tsx`
  - Home tab: `app/(tabs)/index.tsx`
  - Challenges tab: `app/(tabs)/challenges.tsx`
  - Profile tab: `app/(tabs)/profile.tsx`
- **Modal Screens:** Use `presentationMode: 'modal'` in Stack

### File Structure for Conversion
```
app/
├── (tabs)/
│   ├── _layout.tsx         # Bottom tab navigator
│   ├── index.tsx           # Home feed (HomePage)
│   ├── challenges.tsx      # Challenge list
│   └── profile.tsx         # User profile
├── challenge/
│   ├── [id].tsx            # Challenge details with tabs
│   └── create.tsx          # Create challenge wizard
├── settings.tsx            # Settings page
├── onboarding.tsx          # Already exists
├── login.tsx               # Already exists
└── signup.tsx              # Already exists
```

---

## Supabase Integration (ALREADY CONFIGURED)

### Auth Context (`context/auth.tsx`)
**Available methods:**
- `signIn(email, password)` - Email/password login
- `signUp(email, password)` - Create account
- `signInWithGoogle()` - Google OAuth
- `signInWithApple()` - Apple Sign-In
- `signInWithMagicLink(email)` - Passwordless email link
- `resetPassword(email)` - Password reset
- `signOut()` - Logout
- `updateProfile(data)` - Update user profile

**Available state:**
- `session` - Current session token
- `user` - Current user object
- `isLoading` - Auth loading state
- `hasLaunched` - Onboarding completed flag

### Database Tables (TO BE CREATED)
You need to create these tables in Supabase:

#### `challenges`
```sql
- id (uuid, primary key)
- title (text)
- description (text)
- type (enum: 'personal', 'team', 'group')
- duration (integer)
- duration_type (enum: 'days', 'weeks')
- group_id (uuid, foreign key to groups)
- image_url (text)
- created_by (uuid, foreign key to auth.users)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `tasks`
```sql
- id (uuid, primary key)
- challenge_id (uuid, foreign key)
- title (text)
- description (text)
- is_recurring (boolean)
- recurring_days (text[] - ['monday', 'tuesday'])
- order_index (integer)
- created_at (timestamp)
```

#### `task_completions`
```sql
- id (uuid, primary key)
- task_id (uuid, foreign key)
- user_id (uuid, foreign key)
- challenge_id (uuid, foreign key)
- completed_at (timestamp)
- notes (text)
- ability_points_awarded (integer)
- status (enum: 'success', 'fail')
```

#### `challenge_participants`
```sql
- id (uuid, primary key)
- challenge_id (uuid, foreign key)
- user_id (uuid, foreign key)
- team_id (uuid, foreign key, nullable)
- joined_at (timestamp)
- current_streak (integer, default: 0)
- total_ability_points (integer, default: 0)
```

#### `teams`
```sql
- id (uuid, primary key)
- challenge_id (uuid, foreign key)
- name (text)
- color (text)
- created_at (timestamp)
```

#### `groups`
```sql
- id (uuid, primary key)
- name (text)
- description (text)
- logo_emoji (text)
- color (text)
- location (text)
- founded (text)
- created_by (uuid, foreign key)
- created_at (timestamp)
```

#### `posts`
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- challenge_id (uuid, foreign key)
- message (text)
- note (text)
- image_url (text)
- type (enum: 'success', 'fail')
- created_at (timestamp)
- likes_count (integer, default: 0)
- ability_points_given (integer, default: 0)
```

#### `notifications`
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- type (enum: 'like', 'points', 'challenge', 'streak')
- message (text)
- from_user_id (uuid, foreign key, nullable)
- post_id (uuid, foreign key, nullable)
- read (boolean, default: false)
- created_at (timestamp)
```

#### `profiles` (extends auth.users)
```sql
- id (uuid, primary key, foreign key to auth.users)
- display_name (text)
- avatar_url (text)
- bio (text)
- username (text, unique)
- total_streaks (integer, default: 0)
- total_ability_points (integer, default: 0)
- challenges_completed (integer, default: 0)
- created_at (timestamp)
- updated_at (timestamp)
```

---

## Styling: Tailwind → NativeWind

**Good news:** Your React Native project already uses **NativeWind**, which is Tailwind for React Native!

### Example Conversion:
**React (Tailwind):**
```jsx
<div className="bg-black min-h-screen p-6">
  <h1 className="text-white text-2xl font-bold mb-4">Hello</h1>
  <button className="bg-cyan-500 text-black py-3 px-6 rounded-xl">
    Click Me
  </button>
</div>
```

**React Native (NativeWind):**
```jsx
<View className="bg-black min-h-screen p-6">
  <Text className="text-white text-2xl font-bold mb-4">Hello</Text>
  <TouchableOpacity className="bg-cyan-500 text-black py-3 px-6 rounded-xl">
    <Text className="text-black font-bold">Click Me</Text>
  </TouchableOpacity>
</View>
```

### Style Prop for Colors (when needed):
```jsx
// Use inline style for hex colors not in Tailwind
<View style={{ backgroundColor: '#00c2ff' }}>
```

---

## Icons: lucide-react → @expo/vector-icons

**React:** `import { Home, Trophy, User } from 'lucide-react';`  
**React Native:** Use `Ionicons` or install `lucide-react-native`

### Using Ionicons (already installed):
```jsx
import { Ionicons } from '@expo/vector-icons';

<Ionicons name="home" size={24} color="white" />
<Ionicons name="trophy" size={24} color="white" />
<Ionicons name="person" size={24} color="white" />
```

### Or install lucide-react-native:
```bash
npm install lucide-react-native
```

---

## Images

### React:
```jsx
import logo from 'figma:asset/ae280b92ceef7e198522f0872d65dd755e21ef9b.png';
<img src={logo} alt="Logo" />
<img src="https://images.unsplash.com/..." />
```

### React Native:
```jsx
import logo from '@/assets/logo.png'; // Local asset
<Image source={logo} style={{ width: 160, height: 40 }} />
<Image source={{ uri: 'https://images.unsplash.com/...' }} />
```

Use `expo-image` (already installed) for better performance:
```jsx
import { Image } from 'expo-image';
<Image source={logo} style={{ width: 160, height: 40 }} />
```

---

## Bottom Navigation (iOS Style Pill)

The React app has a custom iOS-style bottom navigation with:
- Glassmorphism effect
- Pill shape (rounded-full)
- Active state with background glow
- Icons + labels

### Implement in React Native:
Create a custom tab bar component for `app/(tabs)/_layout.tsx`:
```jsx
<Tabs
  screenOptions={{
    tabBarStyle: {
      position: 'absolute',
      bottom: 24,
      left: 48,
      right: 48,
      backgroundColor: 'rgba(39, 39, 42, 0.9)',
      borderRadius: 9999,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    // Custom tab bar component here
  }}
>
```

---

## Animation Notes

### React:
- Hover effects with CSS
- Animated dots using transforms

### React Native:
- Use `react-native-reanimated` (already installed)
- Gestures with `react-native-gesture-handler` (already installed)
- Example: Animated dot indicators on onboarding

---

## Testing Checklist After Conversion

### Onboarding & Auth
- [ ] Onboarding slides with images and dots
- [ ] Navigate between slides
- [ ] "Get Started" navigates to signup
- [ ] Login/Signup form validation
- [ ] Google Sign-In works
- [ ] Apple Sign-In works
- [ ] Magic Link email sent
- [ ] Password reset email sent
- [ ] Navigate to main app after auth

### Home Feed
- [ ] Posts render correctly
- [ ] Tabs filter posts (All vs My Challenges)
- [ ] Notification bell shows badge
- [ ] Notifications sheet opens
- [ ] Group banner displays for group challenges
- [ ] Challenge details sheet opens
- [ ] Give Points sheet opens
- [ ] Like button works
- [ ] Bottom navigation works

### Challenges
- [ ] Challenge list displays
- [ ] Search challenges works
- [ ] Filter buttons work
- [ ] Create challenge wizard (all 4 steps)
- [ ] Challenge details tabs (Tasks, Leaderboard, Messages)
- [ ] Mark task complete
- [ ] Admit failure

### Profile
- [ ] User stats display
- [ ] Edit profile works
- [ ] Settings page opens
- [ ] Logout works

---

## Conversion Strategy

### Phase 1: Foundation (Week 1)
1. ✅ Update Onboarding screen to match React design
2. ✅ Update Login/Signup screens with social auth buttons
3. Create Supabase database tables
4. Test auth flows

### Phase 2: Main App (Week 2-3)
5. Create bottom tab navigation
6. Implement HomePage/Feed with posts
7. Implement Challenge List
8. Implement Profile screen

### Phase 3: Challenge Features (Week 3-4)
9. Implement Challenge Details with tabs
10. Implement Create Challenge wizard
11. Implement Settings page
12. Add notifications

### Phase 4: Polish (Week 5)
13. Add animations and transitions
14. Test on iOS and Android
15. Fix UI issues
16. Performance optimization

---

## Key Differences & Gotchas

1. **No `div`, use `View`:** All containers must be `<View>`
2. **All text in `<Text>`:** Cannot render text directly in View
3. **No CSS hover:** Use `onPressIn`/`onPressOut` for button states
4. **ScrollView required:** Screens need `<ScrollView>` for scrolling
5. **Modal vs Sheet:** React Native doesn't have Radix Sheet; use Modal
6. **SafeAreaView:** Wrap screens in `<SafeAreaView>` to avoid notch
7. **No `className` for some styles:** Use `style` prop for hex colors
8. **Images need dimensions:** Specify width/height explicitly

---

## Resources

- **Expo Router Docs:** https://docs.expo.dev/router/introduction/
- **NativeWind Docs:** https://www.nativewind.dev/
- **Supabase Docs:** https://supabase.com/docs
- **React Native Docs:** https://reactnative.dev/
- **Expo Docs:** https://docs.expo.dev/

---

## Questions or Issues?

When converting, refer to this document and the `agent.md` file for step-by-step instructions.

**Supabase is already configured!** Use the existing `context/auth.tsx` for all auth operations.

**Start with Onboarding and Auth first**, then move to the main app screens.
