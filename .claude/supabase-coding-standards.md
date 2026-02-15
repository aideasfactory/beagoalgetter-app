# Supabase Coding Standards (Goal Getter)

## 1. Project Snapshot
- **Database:** PostgreSQL via Supabase
- **Auth:** Supabase Auth (Apple Sign-In, Google Sign-In, Email/Password)
- **Storage:** Supabase Storage (avatars, challenge-images, post-images)
- **Real-time:** Supabase Realtime (postgres_changes)
- **Client:** `@supabase/supabase-js` v2
- **Schema Reference:** See `.claude/database-schema.md`

## 2. Supabase Client

The Supabase client is initialized in `supabase/supabase.ts` (or `supabase.ts` at root).

**Always import from the project's configured client:**
```typescript
import { supabase } from '@/supabase';
```

**Never create additional Supabase client instances.**

## 3. Query Patterns

### Reading Data
```typescript
// Single record
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Multiple records with ordering
const { data, error } = await supabase
  .from('challenges')
  .select('*')
  .order('created_at', { ascending: false });

// With joins (use views when available)
const { data, error } = await supabase
  .from('posts_with_details')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(20);
```

### Writing Data
```typescript
// Insert
const { data, error } = await supabase
  .from('challenges')
  .insert({ title, description, type, created_by: user.id })
  .select()
  .single();

// Update
const { data, error } = await supabase
  .from('profiles')
  .update({ display_name: newName })
  .eq('id', user.id)
  .select()
  .single();

// Delete
const { error } = await supabase
  .from('post_likes')
  .delete()
  .eq('post_id', postId)
  .eq('user_id', user.id);
```

### Error Handling (MANDATORY)
Every Supabase call MUST handle errors:

```typescript
const { data, error } = await supabase
  .from('challenges')
  .select('*');

if (error) {
  console.error('Failed to fetch challenges:', error.message);
  // Handle error appropriately (show toast, set error state, etc.)
  return;
}
```

## 4. Authentication Patterns

### Get Current User
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  // Handle not authenticated
  return;
}
```

### Auth State Listener
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  // Handle auth state changes
});
```

### Never expose auth tokens or manipulate them directly.

## 5. Row Level Security (RLS)

- All tables have RLS enabled
- **Never bypass RLS** - always query as the authenticated user
- When writing new RLS policies, follow existing patterns:
  - Public read for social content (profiles, challenges, posts)
  - Owner-only write for personal content
  - Participant-only access for challenge-specific content
  - Private access for notifications

### RLS Policy Naming Convention
```sql
"[Entity] are viewable by everyone"
"Users can [action] their own [entity]"
"[Role] can manage [entity]"
```

## 6. Storage Patterns

### Existing Buckets
- `avatars` - User profile pictures (public read)
- `challenge-images` - Challenge cover images (public read)
- `post-images` - Post/completion images (public read)

### Upload Pattern
```typescript
const fileName = `${userId}/${Date.now()}.${fileExt}`;

const { error: uploadError } = await supabase.storage
  .from('avatars')
  .upload(fileName, file);

if (uploadError) throw uploadError;

const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl(fileName);

return data.publicUrl;
```

## 7. Real-time Subscriptions

```typescript
const channel = supabase
  .channel('channel-name')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'posts' },
    (payload) => {
      // Handle new data
    }
  )
  .subscribe();

// Always clean up subscriptions
return () => {
  supabase.removeChannel(channel);
};
```

## 8. Migration Standards

### File Naming
```
supabase/migrations/001_add_profile_streak_and_badges.sql
supabase/migrations/002_add_comments_table.sql
```

- Use sequential numbering with descriptive names
- Include rollback comments in SQL when possible

### Migration Checklist
When adding a new migration:
1. [ ] Create SQL file in `supabase/migrations/`
2. [ ] Include RLS policies for new tables
3. [ ] Add appropriate indexes
4. [ ] Update `.claude/database-schema.md`
5. [ ] Update TypeScript types if applicable

## 9. TypeScript Types

- Type definitions for database tables live in `types/database.example.ts`
- When schema changes, update the corresponding TypeScript interfaces
- Use proper typing for all Supabase responses:

```typescript
interface Challenge {
  id: string;
  title: string;
  description: string | null;
  // ... etc
}

const { data, error } = await supabase
  .from('challenges')
  .select('*')
  .returns<Challenge[]>();
```

## 10. Common Patterns

### Pagination
```typescript
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);
```

### Counting
```typescript
const { count, error } = await supabase
  .from('notifications')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('read', false);
```

### Using Views
Prefer database views for complex joins:
- `posts_with_details` - Posts with user/challenge/group info
- `challenge_leaderboard` - Ranked participants with profiles
- `notifications_with_users` - Notifications with sender profile info

## 11. Things to NEVER Do

- Never use `service_role` key in the mobile app
- Never store Supabase credentials in component state
- Never bypass RLS with `.rpc()` unless absolutely necessary
- Never use raw SQL in the app - use the Supabase client
- Never hardcode Supabase URLs - use environment variables
