# API Implementation Agent

> **Purpose:** This agent defines how all Supabase + API-related
code must be structured and implemented in this project.
> Any time you add or change Supabase/API logic, you should 
explicitly reference this **API Implementation Agent** so these
rules are followed.

     ---

     ## 1. Agent Identity & Scope

     **Name:** API Implementation Agent
     **Primary Goal:** Implement and maintain all data access logic in
     a way that is **scalable, reusable, and consistent**, using
     Supabase as the backend.

     **Responsibilities:**

     1. Enforce a **layered architecture**:
        - Supabase client → Services → Hooks → UI.
     2. Ensure **no direct Supabase calls** from components or screens.
     3. Keep **auth/session**, **data fetching**, and **UI** concerns
     separated.
     4. Prefer **typed, domain-oriented APIs** over ad-hoc queries.
     5. Reuse and extend existing patterns: `supabase.ts`,
     `services/openai.ts`, and `types/database.example.ts`.

     ---

     ## 2. Architecture Layers (Must-Follow Pattern)

     ### 2.1 Supabase Client Layer

     - **File:** `supabase.ts`
     - **Responsibilities:**
       - Create and configure the single Supabase client.
       - Handle auth storage and token refresh configuration.

     **Rules:**

     - This is the **only** place where `createClient` is called.
     - All services import the shared client:

     ```ts
     import { supabase } from '@/supabase';

   ──────────────────────────────────────────

   2.2 Types & Schema Layer

   •  Folder: types/
     •  types/supabase.ts – generated types from Supabase.
     •  types/domain.ts – app/domain-oriented types.

   Rules:

   1. types/* files contain only TypeScript types/interfaces (no
      Supabase calls, no logic).
   2. Use types/supabase.ts as the source of truth for DB tables.
   3. Define app-facing/domain types in types/domain.ts, such as:

   ts
     export type ChallengeType = 'personal' | 'team' | 'group';
     export type DurationType = 'days' | 'weeks';
     export type CompletionStatus = 'success' | 'fail';
     export type NotificationType = 'like' | 'points' | 'challenge' |
     'streak';

     export interface Profile { /* ... */ }
     export interface Group { /* ... */ }
     export interface Challenge { /* ... */ }
     export interface Task { /* ... */ }
     export interface Team { /* ... */ }
     export interface ChallengeParticipant { /* ... */ }
     export interface TaskCompletion { /* ... */ }
     export interface Post { /* ... */ }
     export interface Notification { /* ... */ }
     export interface PostLike { /* ... */ }

     export interface PostWithDetails extends Post { /* joins */ }
     export interface ChallengeWithDetails extends Challenge { /* joins
      */ }
     export interface LeaderboardEntry extends ChallengeParticipant {
     /* rank, etc. */ }

   ──────────────────────────────────────────

   2.3 Domain Service Layer (Core “API Endpoints”)

   •  Folder: services/
   •  Pattern: One file per domain (profile, challenge, task, etc.).

   Responsibilities:

   •  Contain all Supabase queries and mutations.
   •  Provide pure async functions that can be called from anywhere (no
       React).
   •  Implement auth-aware operations using the shared Supabase client.

   Rules:

   1. Domain-driven organization: group by business domain, not by HTTP
       method/table.
   2. No React in services: no hooks, no JSX, no Alert.
   3. Supabase usage: always import the shared client:

   ts
        import { supabase } from '@/supabase';

   4. Auth inside services when needed:
     •  Use supabase.auth.getUser() or a shared helper.
     •  Throw if a user is required but not authenticated.

   ──────────────────────────────────────────

   2.4 Hooks / React Integration Layer

   •  Folder: hooks/
   •  Responsibilities:
     •  Wrap service functions in React hooks.
     •  Manage loading, error, and lifecycle for data fetching and
        realtime.

   Rules:

   1. Hooks call services, not supabase directly.
   2. Hooks own:
     •  loading / isLoading
     •  error
     •  subscription setup/teardown for realtime features
   3. Hooks return data in a UI-friendly shape.

   ──────────────────────────────────────────

   2.5 UI & Context Layer

   •  Folders: app/, components/, context/
   •  Responsibilities:
     •  Render data and orchestrate flows (navigation, auth flows,
        etc.).

   Rules:

   1. Screens and components:
     •  Use hooks (e.g. useChallenges, useProfile, useNotifications)
        or, rarely, call services directly.
     •  Must not import or use supabase directly.

   2. Auth context (`context/auth.tsx`):
     •  Manages session, sign-in logic, and navigation.
     •  May use supabase.auth.* directly or delegate to a dedicated
        authService.
     •  Should delegate profile/data operations to domain services
        (e.g. profileService).

   ──────────────────────────────────────────

   3. Concrete File & Function Structure

   3.1 Types

   `types/supabase.ts`

   •  Generated via Supabase CLI; contains DB types only.

   `types/domain.ts`

   •  Contains domain-oriented types, e.g.:

   ts
     export type ChallengeType = 'personal' | 'team' | 'group';
     export type DurationType = 'days' | 'weeks';
     export type CompletionStatus = 'success' | 'fail';
     export type NotificationType = 'like' | 'points' | 'challenge' |
     'streak';

     export interface Profile { /* ... */ }
     export interface Group { /* ... */ }
     export interface Challenge { /* ... */ }
     export interface Task { /* ... */ }
     export interface Team { /* ... */ }
     export interface ChallengeParticipant { /* ... */ }
     export interface TaskCompletion { /* ... */ }
     export interface Post { /* ... */ }
     export interface Notification { /* ... */ }
     export interface PostLike { /* ... */ }

     export interface PostWithDetails extends Post { /* ... */ }
     export interface ChallengeWithDetails extends Challenge { /* ... 
     */ }
     export interface LeaderboardEntry extends ChallengeParticipant {
     /* ... */ }

   ──────────────────────────────────────────

   3.2 Services (Core API Layer)

   Folder: services/

   `services/profile.ts`

   ts
     import type { Profile } from '@/types/domain';

     export const profileService = {
       getMyProfile(): Promise<Profile | null>,
       updateProfile(updates: Partial<Profile>): Promise<Profile>,
       searchUsers(query: string): Promise<Profile[]>,
     };

   `services/challenge.ts`

   ts
     import type { Challenge, ChallengeWithDetails } from
     '@/types/domain';

     export const challengeService = {
       getAllChallenges(): Promise<Challenge[]>,
       getChallengeById(id: string): Promise<ChallengeWithDetails |
     null>,
       createChallenge(
         challenge: Omit<Challenge, 'id' | 'created_at' | 'updated_at'
     | 'created_by'>
       ): Promise<Challenge>,
       joinChallenge(challengeId: string): Promise<any>,  // refine 
     type as needed
       leaveChallenge(challengeId: string): Promise<void>,
       getMyChallenges(): Promise<Challenge[]>,
     };

   `services/task.ts`

   ts
     import type { Task, TaskCompletion, CompletionStatus } from
     '@/types/domain';

     export const taskService = {
       getChallengeTasks(challengeId: string): Promise<Task[]>,
       completeTask(
         taskId: string,
         challengeId: string,
         status: CompletionStatus,
         notes?: string,
         abilityPoints?: number
       ): Promise<TaskCompletion>,
       getUserCompletions(challengeId: string):
     Promise<TaskCompletion[]>,
     };

   `services/post.ts`

   ts
     import type { Post, PostWithDetails, CompletionStatus } from
     '@/types/domain';

     export const postService = {
       getFeedPosts(limit?: number): Promise<PostWithDetails[]>,
       getMyChallengePosts(limit?: number): Promise<PostWithDetails[]>,
       createPost(
         challengeId: string,
         message: string,
         type: CompletionStatus,
         note?: string,
         imageUrl?: string
       ): Promise<Post>,
       likePost(postId: string): Promise<void>,
       unlikePost(postId: string): Promise<void>,
       hasUserLiked(postId: string): Promise<boolean>,
     };

   `services/notification.ts`

   ts
     import type { Notification } from '@/types/domain';

     export const notificationService = {
       getNotifications(): Promise<Notification[]>,
       getUnreadCount(): Promise<number>,
       markAsRead(notificationId: string): Promise<void>,
       markAllAsRead(): Promise<void>,
     };

   `services/leaderboard.ts`

   ts
     import type { LeaderboardEntry } from '@/types/domain';

     export const leaderboardService = {
       getChallengeLeaderboard(challengeId: string):
     Promise<LeaderboardEntry[]>,
     };

   `services/storage.ts`

   ts
     export const storageService = {
       uploadAvatar(userId: string, file: File | Blob):
     Promise<string>,
       uploadChallengeImage(file: File | Blob): Promise<string>,
       uploadPostImage(file: File | Blob): Promise<string>,
     };

   `services/realtime.ts`

   ts
     import type { Post, Notification } from '@/types/domain';

     export const realtimeService = {
       subscribeToNewPosts(callback: (post: Post) => void): () => void,
       subscribeToNotifications(
         userId: string,
         callback: (notification: Notification) => void
       ): () => void,
     };

   `services/auth.ts` (optional helper)

   ts
     export const authService = {
       getCurrentUser(): Promise<{ id: string } | null>,
     };

   `services/index.ts` (barrel file)

   ts
     export * from './profile';
     export * from './challenge';
     export * from './task';
     export * from './post';
     export * from './notification';
     export * from './leaderboard';
     export * from './storage';
     export * from './realtime';
     export * from './openai';  // existing
     export * from './auth';    // if created

   ──────────────────────────────────────────

   3.3 Hooks (React Integration)

   Folder: hooks/

   `hooks/useProfile.ts`

   ts
     import type { Profile } from '@/types/domain';

     export function useProfile(): {
       profile: Profile | null;
       loading: boolean;
       error: Error | null;
       refetch: () => Promise<void>;
     };

   `hooks/useChallenges.ts`

   ts
     import type { Challenge } from '@/types/domain';

     export function useChallenges(): {
       challenges: Challenge[];
       loading: boolean;
       error: Error | null;
       refetch: () => Promise<void>;
     };

   `hooks/useMyChallenges.ts`

   ts
     import type { Challenge } from '@/types/domain';

     export function useMyChallenges(): {
       challenges: Challenge[];
       loading: boolean;
       error: Error | null;
       refetch: () => Promise<void>;
     };

   `hooks/useChallenge.ts`

   ts
     import type { ChallengeWithDetails, Task } from '@/types/domain';

     export function useChallenge(
       challengeId: string
     ): {
       challenge: ChallengeWithDetails | null;
       tasks: Task[];
       loading: boolean;
       error: Error | null;
       refetch: () => Promise<void>;
     };

   `hooks/useNotifications.ts`

   ts
     import type { Notification } from '@/types/domain';

     export function useNotifications(): {
       notifications: Notification[];
       unreadCount: number;
       loading: boolean;
       error: Error | null;
       markAsRead: (id: string) => Promise<void>;
       markAllAsRead: () => Promise<void>;
       refetch: () => Promise<void>;
     };

   `hooks/useFeed.ts`

   ts
     import type { PostWithDetails } from '@/types/domain';

     export function useFeed(
       limit?: number
     ): {
       posts: PostWithDetails[];
       loading: boolean;
       error: Error | null;
       refetch: () => Promise<void>;
     };

   `hooks/useLeaderboard.ts`

   ts
     import type { LeaderboardEntry } from '@/types/domain';

     export function useLeaderboard(
       challengeId: string
     ): {
       entries: LeaderboardEntry[];
       loading: boolean;
       error: Error | null;
       refetch: () => Promise<void>;
     };

   Realtime hooks (optional)

   ts
     // hooks/useRealtimePosts.ts
     import type { Post } from '@/types/domain';

     export function useRealtimePosts(onNewPost: (post: Post) => void):
      void;

     // hooks/useRealtimeNotifications.ts
     import type { Notification } from '@/types/domain';

     export function useRealtimeNotifications(
       userId: string,
       onNotification: (notification: Notification) => void
     ): void;

   ──────────────────────────────────────────

   4. Error Handling & Validation Rules

   1. Service layer:
     •  Prefer throwing Supabase errors directly when something fails.
     •  Alternatively, standardize on returning { data, error }; be
        consistent.

   2. Hooks:
     •  Catch errors and expose them via an error state.
     •  Do not show alerts or toasts at the service layer; keep
        user-facing messaging in components or context.

   3. Validation:
     •  Use zod (already installed) to validate inputs before calling
        services.
     •  Optionally validate responses for critical flows.

   ──────────────────────────────────────────

   5. Realtime & Notifications

   •  Put realtime wiring into services/realtime.ts.
   •  Build thin hooks (useRealtimePosts, useRealtimeNotifications) to
      manage subscription lifecycle.
   •  UI components receive realtime updates via these hooks, not via
      direct Supabase subscriptions.

   ──────────────────────────────────────────

   6. External APIs (OpenAI Pattern)

   •  All non-Supabase APIs live in services/<provider>.ts.
   •  Follow services/openai.ts:
     •  Centralized axios calls.
     •  Use environment variables for keys.
     •  Typed responses and simple exported functions.

   ──────────────────────────────────────────

   7. Forbidden Patterns

   The API Implementation Agent must reject or refactor any proposals
   or code that:

   1. Imports supabase directly in:
     •  'app/*'
     •  'components/*'
     •  Non-service hooks.
   2. Mixes Supabase queries and React rendering logic in the same
      file.
   3. Duplicates query logic across multiple screens instead of
      centralizing in services/.
   4. Creates additional Supabase client instances outside supabase.ts.

   ──────────────────────────────────────────

   8. How to Use This Agent in Requests

   When asking for new API functionality, explicitly reference this
   spec, e.g.:

    “Using the **API Implementation Agent** architecture, add a service
     and hook to fetch a user’s challenges and integrate it into the 
    home feed.”

    9. Loading & Error Handling in Views (Preloaders Required)

     **Rule:** All data-driven views must show a preloader and handle
     errors explicitly.

     1. **Hooks must expose:**
        - `loading: boolean`
        - `error: Error | null` (or a typed error shape)
        - `refetch(): Promise<void>` (when relevant)

     2. **Screens/components must:**
        - Show a loading UI (spinner/skeleton) whenever `loading ===
     true`.
        - Show an error UI/message whenever `error` is non-null.
        - Never call async services directly inside JSX without
     `try/catch`.
        - Prefer `async/await` with `try/catch` in event handlers (e.g.
      button presses) and use `setState` to reflect success/error.

     3. **Forbidden:**
        - Ignoring `loading` or `error` from hooks.
        - Fire-and-forget async calls without `try/catch` in views.