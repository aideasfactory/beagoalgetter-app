# Frontend Coding Standards (Goal Getter - React Native)

## 1. Project Snapshot
- **Framework:** React Native 0.79 + Expo 53
- **Language:** TypeScript (strict mode)
- **Styling:** NativeWind 4 (Tailwind CSS for React Native)
- **Navigation:** Expo Router 5 (file-based routing)
- **State:** React Context API + custom hooks
- **Forms:** React Hook Form + Zod validation

## 2. File Structure

```
app/                    # Expo Router pages (file-based routing)
├── _layout.tsx         # Root layout
├── (tabs)/             # Tab navigation group
│   ├── _layout.tsx     # Tab bar layout
│   ├── home.tsx        # Home feed
│   ├── challenges.tsx  # Challenges list
│   └── profile.tsx     # User profile
├── challenge/          # Challenge routes
│   ├── [id]/           # Dynamic routes
│   └── create.tsx      # Create challenge
├── login.tsx           # Auth screens
└── settings.tsx        # Settings

components/             # Reusable components
├── Button.tsx          # Shared UI components
├── Card.tsx
├── ChallengeCard.tsx   # Domain-specific components
├── PostCard.tsx
├── challenge-tabs/     # Feature-specific groups
└── create-challenge/   # Wizard steps

hooks/                  # Custom React hooks
context/                # React Context providers
services/               # API/business logic
types/                  # TypeScript definitions
constants/              # App constants
utils/                  # Utility functions
```

## 3. Component Patterns

### Functional Components with TypeScript
```typescript
interface ChallengeCardProps {
  challenge: Challenge;
  onPress: () => void;
}

export function ChallengeCard({ challenge, onPress }: ChallengeCardProps) {
  return (
    <TouchableOpacity onPress={onPress} className="bg-white rounded-xl p-4">
      <Text className="text-lg font-bold">{challenge.title}</Text>
    </TouchableOpacity>
  );
}
```

### Hooks Pattern
```typescript
export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*');
      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadChallenges(); }, []);

  return { challenges, loading, refetch: loadChallenges };
}
```

## 4. Styling with NativeWind

### Use Tailwind classes via `className`
```typescript
// ✅ DO: Use NativeWind className
<View className="flex-1 bg-white p-4">
  <Text className="text-xl font-bold text-gray-900">Title</Text>
</View>

// ❌ DON'T: Use inline StyleSheet objects for simple styling
<View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
```

### When StyleSheet IS appropriate
- Complex animations
- Dynamic values that can't be expressed in Tailwind
- Performance-critical components

## 5. Navigation (Expo Router)

### File-based routing
- Pages go in `app/` directory
- Dynamic routes use `[param]` folders
- Tab navigation uses `(tabs)` group
- Layouts use `_layout.tsx`

### Navigation patterns
```typescript
import { router } from 'expo-router';

// Navigate
router.push('/challenge/123');
router.replace('/login');
router.back();

// With params
router.push({ pathname: '/challenge/[id]', params: { id: '123' } });
```

## 6. Loading & Error States

### Always handle loading states
```typescript
if (loading) {
  return <LoadingScreen />;
}
```

### Always handle error states
```typescript
if (error) {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-red-500">Something went wrong</Text>
      <Button onPress={refetch} title="Retry" />
    </View>
  );
}
```

## 7. Form Handling

### Use React Hook Form + Zod
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

## 8. Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ChallengeCard.tsx` |
| Hooks | camelCase with `use` prefix | `useProfile.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_CHALLENGES` |
| Types/Interfaces | PascalCase | `ChallengeParticipant` |
| Screen files | kebab-case (Expo Router) | `forgot-password.tsx` |

## 9. Key Libraries Reference

| Library | Purpose |
|---------|---------|
| `expo-router` | File-based navigation |
| `nativewind` | Tailwind CSS styling |
| `@supabase/supabase-js` | Backend client |
| `react-hook-form` + `zod` | Form handling & validation |
| `expo-image` | Optimized image loading |
| `expo-image-picker` | Camera/gallery access |
| `expo-notifications` | Push notifications |
| `expo-secure-store` | Secure local storage |
| `@sentry/react-native` | Error tracking |
| `i18next` | Internationalization |

## 10. Things to NEVER Do

- Never use `StyleSheet.create` when NativeWind classes work
- Never hardcode colors - use Tailwind color classes
- Never use `any` type - always define proper types
- Never leave `console.log` in production code
- Never store sensitive data in AsyncStorage - use SecureStore
- Never import from `react-native` when an Expo equivalent exists
