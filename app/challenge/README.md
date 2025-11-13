# Challenge Details Screen

## File Structure

```
app/challenge/
└── [id].tsx        # Dynamic route for challenge details
```

## Screen Layout

```
┌─────────────────────────────────────┐
│  ←  [Hero Image]              ⊙     │ ← Back & Share buttons
│                                     │
│  Group • 12 members                 │ ← Badge
│  30-Day Fitness Challenge           │ ← Title
│                                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │🔥15│ │🏆12│ │👥12│ │📅15│      │ ← Stats
│  └────┘ └────┘ └────┘ └────┘      │
├─────────────────────────────────────┤
│ Overall Progress    [███░░░] 15/30  │ ← Progress bar
│ Description text...                 │
├─────────────────────────────────────┤
│   Tasks  |  Leaderboard  | Messages │ ← Tabs
├═════════════════════════════════════┤
│                                     │
│   [Tab Content Area]                │ ← Tab components
│   - TaskTrackerTab                  │
│   - LeaderboardTab                  │
│   - MessagesTab                     │
│                                     │
│                                     │
│   (Scrollable content)              │
│                                     │
├─────────────────────────────────────┤
│ [Mark Complete] [Admit Failure]     │ ← Fixed buttons
└─────────────────────────────────────┘
```

## Component Hierarchy

```
ChallengeDetailsScreen
├── ScrollView
│   ├── Hero Section (480px)
│   │   ├── Image (background)
│   │   ├── LinearGradient (overlay)
│   │   ├── SafeAreaView (top actions)
│   │   │   ├── Back Button
│   │   │   └── Share Button
│   │   ├── Title & Badge
│   │   └── Stats Grid (4 cards)
│   ├── Progress Section
│   │   ├── Progress Bar
│   │   └── Description
│   ├── Tabs Navigation
│   │   ├── Tasks Tab Button
│   │   ├── Leaderboard Tab Button
│   │   └── Messages Tab Button
│   └── Tab Content
│       ├── TaskTrackerTab (when active)
│       ├── LeaderboardTab (when active)
│       └── MessagesTab (when active)
└── Fixed Bottom Section
    └── SafeAreaView (action buttons)
        ├── Mark Complete Button
        └── Admit Failure Button
```

## Props & State

### Route Parameters
```tsx
const { id } = useLocalSearchParams<{ id: string }>();
// Example: /challenge/c123 → id = "c123"
```

### State
```tsx
const [activeTab, setActiveTab] = useState<'tasks' | 'leaderboard' | 'messages'>('tasks');
```

### Mock Data (Replace with Supabase)
```tsx
const mockChallengeData = {
  id: string;
  title: string;
  description: string;
  image: string;
  type: 'Personal' | 'Team' | 'Group';
  progress: number; // 0-100
  daysCompleted: number;
  totalDays: number;
  currentStreak: number;
  members: number;
  startDate: string;
  endDate: string;
  totalPoints: number;
}
```

## Key Features

### Dynamic Routing
- URL: `/challenge/[id]`
- Example: `/challenge/c123`
- Uses Expo Router's file-based routing

### Tab Management
- State-based tab switching
- Only renders active tab content
- Smooth transitions

### Fixed Bottom Actions
- Always visible (not scrolled)
- Safe area aware
- Confirmation alerts before actions

### Responsive Design
- Hero adapts to screen width
- Stats grid responsive (4 columns)
- Safe areas for notch/status bar
- Proper scroll behavior

## Navigation Flow

```
Challenge List Screen
    │
    ├─→ User taps challenge card
    │
    └─→ /challenge/[id]
            │
            ├─→ Tabs: Tasks / Leaderboard / Messages
            │
            ├─→ Back button → returns to previous
            │
            └─→ Actions: Mark Complete / Admit Failure
```

## Color Scheme

| Element | Color | Usage |
|---------|-------|-------|
| Streak | `#00c2ff` (cyan) | Icon background |
| Points | `#84cc16` (green) | Icon background |
| Members | `#a855f7` (purple) | Icon background |
| Days | `#f97316` (orange) | Icon background |
| Active Tab | `#00c2ff` | Border bottom |
| Complete Btn | `#00c2ff` | Background |
| Failure Btn | `#ef4444` (red) | Background |

## Testing Commands

### Navigate to Challenge
```tsx
// From Challenge List
router.push('/challenge/c123');

// With parameters
router.push({
  pathname: '/challenge/[id]',
  params: { id: 'c123' }
});
```

### Test Tab Switching
1. Tap "Tasks" tab → should show TaskTrackerTab
2. Tap "Leaderboard" tab → should show LeaderboardTab
3. Tap "Messages" tab → should show MessagesTab
4. Tab border should highlight active tab

### Test Actions
1. Tap "Mark Complete" → shows alert with Cancel/Complete
2. Tap "Admit Failure" → shows alert with Cancel/Mark Failed
3. Alerts should have correct styling and text

### Test Navigation
1. Tap back button → returns to previous screen
2. Use hardware back button (Android) → returns
3. Swipe from edge (iOS) → returns

## Common Issues & Solutions

### Issue: Tabs not switching
**Solution:** Check `activeTab` state is updating correctly

### Issue: Bottom buttons hidden
**Solution:** Ensure ScrollView has bottom padding (100px)

### Issue: Hero image not loading
**Solution:** Check image URL is valid, use placeholder if needed

### Issue: Back button not working
**Solution:** Ensure `router.back()` is called correctly

### Issue: Safe area not working
**Solution:** Check SafeAreaView is imported from 'react-native-safe-area-context'

## Next Steps

1. **Test navigation flow:**
   - Create challenge list screen
   - Add navigation to this screen
   - Test back navigation

2. **Integrate Supabase:**
   - Fetch challenge by ID
   - Add loading states
   - Handle errors

3. **Add functionality:**
   - Implement Mark Complete logic
   - Implement Admit Failure logic
   - Add real share functionality

4. **Polish:**
   - Add animations
   - Add skeleton loaders
   - Add haptic feedback
   - Add error boundaries

## Related Documentation

- `CHALLENGE_DETAILS_COMPLETE.md` - Full completion summary
- `components/challenge-tabs/README.md` - Tab components docs
- `CHALLENGE_TABS_COMPLETE.md` - Tab implementation details
