# Challenge Tab Components

Three tab components for the Challenge Details screen, converted from React to React Native.

## Components

### 1. TaskTrackerTab
Daily task checklist with photo evidence and notes.

**Features:**
- Current streak display with today's progress
- Task list with checkboxes (required vs optional tasks)
- Photo evidence upload (using expo-image-picker)
- Notes field for reflections
- Submit button (enabled only when all required tasks are complete)

**Usage:**
```tsx
import { TaskTrackerTab } from '@/components/challenge-tabs';

<TaskTrackerTab challengeId="challenge-123" />
```

### 2. LeaderboardTab
Team and individual rankings with performance metrics.

**Features:**
- Team standings with points and streaks
- Top 3 podium display for individuals
- Ranked list of all participants
- Team details modal showing members
- Click team cards to view team details

**Usage:**
```tsx
import { LeaderboardTab } from '@/components/challenge-tabs';

<LeaderboardTab challengeId="challenge-123" />
```

### 3. MessagesTab
One-way communication from challenge admin/owner.

**Features:**
- Three types of messages: announcements, milestones, updates
- Color-coded message cards
- Admin avatar and role badge
- Info alert explaining one-way communication
- Empty state for no messages

**Usage:**
```tsx
import { MessagesTab } from '@/components/challenge-tabs';

<MessagesTab challengeId="challenge-123" />
```

## Example: Challenge Details Screen with Tabs

```tsx
import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TaskTrackerTab, LeaderboardTab, MessagesTab } from '@/components/challenge-tabs';

export default function ChallengeDetailsScreen({ challengeId }) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'leaderboard' | 'messages'>('tasks');

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Tabs */}
      <View className="flex-row border-b border-white/10">
        <TouchableOpacity
          onPress={() => setActiveTab('tasks')}
          className="flex-1 py-4"
          style={{ borderBottomWidth: activeTab === 'tasks' ? 2 : 0, borderBottomColor: '#00c2ff' }}
        >
          <Text className={activeTab === 'tasks' ? 'text-white text-center font-bold' : 'text-white/60 text-center'}>
            Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('leaderboard')}
          className="flex-1 py-4"
          style={{ borderBottomWidth: activeTab === 'leaderboard' ? 2 : 0, borderBottomColor: '#00c2ff' }}
        >
          <Text className={activeTab === 'leaderboard' ? 'text-white text-center font-bold' : 'text-white/60 text-center'}>
            Leaderboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('messages')}
          className="flex-1 py-4"
          style={{ borderBottomWidth: activeTab === 'messages' ? 2 : 0, borderBottomColor: '#00c2ff' }}
        >
          <Text className={activeTab === 'messages' ? 'text-white text-center font-bold' : 'text-white/60 text-center'}>
            Messages
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View className="flex-1">
        {activeTab === 'tasks' && <TaskTrackerTab challengeId={challengeId} />}
        {activeTab === 'leaderboard' && <LeaderboardTab challengeId={challengeId} />}
        {activeTab === 'messages' && <MessagesTab challengeId={challengeId} />}
      </View>
    </SafeAreaView>
  );
}
```

## Data Integration

Currently using mock data. To integrate with Supabase:

1. **TaskTrackerTab:** Query `tasks` and `task_completions` tables
2. **LeaderboardTab:** Query `challenge_participants` and `teams` tables
3. **MessagesTab:** Query `messages` table filtered by challenge

Example Supabase query:
```tsx
const { data: tasks } = await supabase
  .from('tasks')
  .select('*')
  .eq('challenge_id', challengeId)
  .order('order_index');
```

## Styling Notes

- All components use NativeWind (Tailwind CSS for RN)
- Primary color: `#00c2ff` (cyan)
- Background: `#000000` (black)
- Cards: `#1a1a1a` (dark gray)
- Icons from `@expo/vector-icons/Ionicons`

## Next Steps

1. Create Challenge Details screen that uses these tabs
2. Connect to Supabase for real data
3. Add real-time updates with Supabase subscriptions
4. Add haptic feedback on interactions
5. Add animations/transitions between tabs
