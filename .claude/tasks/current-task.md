# Task: Add post comments with bottom-sheet viewing and simple comment management

**Created:** 2026-03-13
**Last Updated:** 2026-03-13T10:30:00Z
**Status:** Complete

---

## Overview

### Goal
Add a comments feature for posts: view, create, delete own comments via a bottom sheet modal. Show comment count on each post card.

### Context
- Tile ID: 019ce62e-6698-701e-aff9-3e8fafa6a821
- Branch: feature/019ce62e-6698-701e-aff9-3e8fafa6a821-add-post-comments-with-bottom-sheet-viewing-and-simple-comme

---

## PHASE 1: PLANNING
**Status:** ✅ Complete

### Decisions
- `post_comments` table with auto-updating `comments_count` on posts (matches `likes_count` pattern)
- Used existing Modal pattern — no new dependencies needed
- RLS: everyone can view, users create own, users delete own

---

## PHASE 2: IMPLEMENTATION
**Status:** ✅ Complete

- [x] Create migration 018_add_post_comments.sql
- [x] Update database-schema.md
- [x] Add PostComment type + update PostWithDetails
- [x] Add comment service methods to services/post.ts
- [x] Create usePostComments hook
- [x] Create CommentsSheet component
- [x] Update PostCard with comment count + tap handler
- [x] Update useFeedPosts to map comments_count
- [x] Update feed screen to integrate CommentsSheet
- [x] Update barrel exports

---

## PHASE 3: FINAL REFLECTION & DOCUMENTATION
**Status:** ✅ Complete

### What was built
- Database: `post_comments` table with RLS, `comments_count` cached column on `posts`, auto-update triggers, updated `posts_with_details` view
- Service: `getPostComments`, `createComment`, `deleteComment` methods with user profile joins
- Hook: `usePostComments` — manages comment loading, creation, deletion with optimistic deletes
- Component: `CommentsSheet` — full-featured bottom sheet with scrollable comments, input bar, keyboard avoiding, delete confirmation for own comments
- Integration: Comment count button in PostCard action row, optimistic count updates in feed

### Patterns followed
- Same Modal pattern as GivePointsModal, NotificationsModal (animationType="slide", presentationStyle="pageSheet")
- Same trigger pattern as likes_count for comments_count
- Same RLS pattern as post_likes
- NativeWind styling throughout
- Proper error handling and loading states

### Technical debt
- No real-time subscription for new comments (can be added later)
- No pagination for comments (fine for typical comment volumes)

### TASK COMPLETE
All 3 phases executed successfully. Migration, types, services, hooks, components, and integration all implemented.
