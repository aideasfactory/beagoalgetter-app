# AI Agent Instructions: React to React Native Conversion

## Purpose
This document provides **step-by-step instructions** for AI agents to convert each screen from the React web app to React Native. Follow these instructions precisely to maintain design consistency and functionality.

---

## Prerequisites Checklist

Before starting any conversion, verify:
- [ ] Read the `CONVERSION_README.md` file completely
- [ ] Understand the file structure in `app/` folder (Expo Router)
- [ ] Know that Supabase auth is ALREADY configured in `context/auth.tsx`
- [ ] Understand NativeWind is used for styling (Tailwind classes)
- [ ] All images must have explicit width/height
- [ ] All text must be wrapped in `<Text>` components

---

## General Conversion Rules

### 1. **Import Translations**
```jsx
// React
import { Component } from './components';

// React Native
import { Component } from '@/components';
import { useTranslation } from 'react-i18next'; // For i18n
```

### 2. **Replace HTML Elements**
```jsx
// React → React Native
<div> → <View>
<span> → <Text>
<p> → <Text>
<button> → <TouchableOpacity> or <Pressable>
<input> → <TextInput>
<textarea> → <TextInput multiline>
<img> → <Image>
<a> → <TouchableOpacity> with navigation
```

### 3. **Styling**
```jsx
// React (Tailwind)
<div className="bg-black p-6 rounded-xl">

// React Native (NativeWind)
<View className="bg-black p-6 rounded-xl">

// For hex colors not in Tailwind:
<View style={{ backgroundColor: '#00c2ff' }}>
```

### 4. **Navigation**
```jsx
// React
navigateTo('home');

// React Native
import { router } from 'expo-router';
router.push('/home');
router.replace('/home'); // No back button
router.back(); // Go back
```

### 5. **Auth Context Usage**
```jsx
import { useSession } from '@/context';

const { signIn, signUp, signInWithGoogle, signInWithApple, user, session } = useSession();

// Example: Login
await signIn(email, password);
```

### 6. **Icons**
```jsx
// React
import { Home, Trophy, User } from 'lucide-react';
<Home className="w-6 h-6 text-white" />

// React Native
import { Ionicons } from '@expo/vector-icons';
<Ionicons name="home" size={24} color="white" />
```

### 7. **Images**
```jsx
// React Native - Always specify dimensions
import { Image } from 'expo-image';

<Image 
  source={{ uri: 'https://...' }} 
  style={{ width: 200, height: 200 }}
  contentFit="cover"
/>
```

### 8. **Safe Area**
```jsx
// Wrap all screens
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView className="flex-1 bg-black">
  {/* Screen content */}
</SafeAreaView>
```

### 9. **Scrollable Screens**
```jsx
// Most screens need ScrollView
import { ScrollView } from 'react-native';

<SafeAreaView className="flex-1 bg-black">
  <ScrollView>
    {/* Content */}
  </ScrollView>
</SafeAreaView>
```

### 10. **Modals / Bottom Sheets**
```jsx
// React uses Radix Sheet
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetContent side="bottom">

// React Native
import { Modal } from 'react-native';

<Modal
  visible={isOpen}
  onRequestClose={() => setIsOpen(false)}
  presentationStyle="pageSheet"
  animationType="slide"
>
  <View className="flex-1 bg-[#1a1a1a]">
    {/* Content */}
  </View>
</Modal>
```

---

## Priority Order: Start Here

### ✅ Phase 1: Onboarding & Auth

#### Task 1.1: Update Onboarding Screen
**File:** `app/onboarding.tsx` and `components/Onboarding.tsx`

**Reference:** `ReactProjectFiles/src/components/Onboarding.tsx`

**Current State:** Basic onboarding exists, needs enhancement

**Steps:**
1. Update to 3 slides (currently 4):
   - Slide 1: "Create Challenges" - Target icon
   - Slide 2: "Track Progress" - TrendingUp icon  
   - Slide 3: "Stay Consistent" - Users icon
2. Each slide structure:
   ```jsx
   <View className="flex-1">
     {/* Full-screen image with gradient overlay */}
     <Image 
       source={{ uri: slide.image }} 
       style={{ position: 'absolute', width: screenWidth, height: screenHeight }}
     />
     <LinearGradient
       colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.6)', '#000000']}
       locations={[0, 0.6, 1]}
       style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
     />
     
     {/* Logo at top */}
     <Image source={require('@/assets/logo.png')} style={{ width: 160, height: 40, marginTop: 60 }} />
     
     {/* Content at bottom */}
     <View style={{ position: 'absolute', bottom: 160 }}>
       {/* Icon in colored box */}
       <View style={{ backgroundColor: '#00c2ff15', width: 80, height: 80, borderRadius: 24 }}>
         <Ionicons name="target" size={40} color="#00c2ff" />
       </View>
       
       {/* Text card */}
       <View className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mt-6">
         <Text className="text-white text-2xl font-bold mb-3">{slide.title}</Text>
         <Text className="text-white/70">{slide.description}</Text>
       </View>
     </View>
     
     {/* Dots indicator */}
     {/* "Next" / "Get Started" button */}
     {/* "Already have an account? Log in" link */}
   </View>
   ```
3. Use `FlatList` horizontal with `pagingEnabled` for swipe navigation
4. Animated dots (scale and opacity on active)
5. Button text changes to "Get Started" on last slide
6. Navigate to `/signup` on "Get Started"
7. Navigate to `/login` on "Log in" link

**Key Differences:**
- Replace `useState` for slide navigation with `FlatList` scroll
- Use `LinearGradient` from `expo-linear-gradient`
- Icons: `lucide-react` → `@expo/vector-icons/Ionicons`

---

#### Task 1.2: Enhance Login/Signup Screen
**Files:** `app/login.tsx`, `app/signup.tsx`

**Reference:** `ReactProjectFiles/src/components/Login.tsx`

**Current State:** Basic forms exist, need social auth buttons and design update

**Steps:**

1. **Create reusable Auth Screen Component** (`components/AuthScreen.tsx`):
```jsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/context';
import { router } from 'expo-router';

interface AuthScreenProps {
  mode: 'login' | 'signup';
}

export function AuthScreen({ mode }: AuthScreenProps) {
  const { signIn, signUp, signInWithGoogle, signInWithApple, signInWithMagicLink } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (mode === 'signup') {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView>
        {/* Background Image */}
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1667791275929-5701d83734c1?...' }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.8)', '#000000']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />

        {/* Logo */}
        <Image source={require('@/assets/logo.png')} style={{ width: 160, height: 40, margin: 24 }} />

        {/* Content */}
        <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
          <Text className="text-white text-3xl font-bold mb-2">
            {mode === 'signup' ? '' : 'Welcome Back'}
          </Text>
          <Text className="text-white/60 mb-8">
            {mode === 'signup' ? 'Start your journey to consistency' : 'Continue your streak'}
          </Text>

          {/* Social Auth Buttons */}
          <View className="flex-row gap-3 mb-6">
            {/* Google */}
            <TouchableOpacity 
              onPress={signInWithGoogle}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl p-4 items-center"
            >
              {/* Google Icon SVG */}
            </TouchableOpacity>
            
            {/* Email (Magic Link) */}
            <TouchableOpacity 
              onPress={() => signInWithMagicLink(email)}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl p-4 items-center"
            >
              <Ionicons name="mail" size={24} color="white" />
            </TouchableOpacity>
            
            {/* Apple */}
            <TouchableOpacity 
              onPress={signInWithApple}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl p-4 items-center"
            >
              <Ionicons name="logo-apple" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px] bg-white/10" />
            <Text className="text-white/40 px-4">Or continue with email</Text>
            <View className="flex-1 h-[1px] bg-white/10" />
          </View>

          {/* Form */}
          {mode === 'signup' && (
            <View className="mb-4">
              <Text className="text-white/60 text-sm mb-2">Full Name</Text>
              <View className="flex-row items-center bg-white/5 border border-white/20 rounded-xl p-4">
                <Ionicons name="person" size={20} color="rgba(255,255,255,0.4)" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="John Doe"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  className="flex-1 text-white ml-3"
                />
              </View>
            </View>
          )}

          <View className="mb-4">
            <Text className="text-white/60 text-sm mb-2">Email</Text>
            <View className="flex-row items-center bg-white/5 border border-white/20 rounded-xl p-4">
              <Ionicons name="mail" size={20} color="rgba(255,255,255,0.4)" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 text-white ml-3"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-white/60 text-sm mb-2">Password</Text>
            <View className="flex-row items-center bg-white/5 border border-white/20 rounded-xl p-4">
              <Ionicons name="lock-closed" size={20} color="rgba(255,255,255,0.4)" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.4)"
                secureTextEntry={!showPassword}
                className="flex-1 text-white ml-3"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="rgba(255,255,255,0.4)" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {mode === 'login' && (
            <TouchableOpacity onPress={() => router.push('/forgot-password')}>
              <Text style={{ color: '#00c2ff' }} className="text-sm text-right mb-6">
                Forgot password?
              </Text>
            </TouchableOpacity>
          )}

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={handleSubmit}
            style={{ backgroundColor: '#00c2ff' }}
            className="rounded-xl p-4 items-center mt-6"
          >
            <Text className="text-black font-bold text-lg">
              {mode === 'signup' ? 'Create Account' : 'Log In'}
            </Text>
          </TouchableOpacity>

          {/* Toggle Mode */}
          <TouchableOpacity 
            onPress={() => router.push(mode === 'login' ? '/signup' : '/login')}
            className="mt-6 items-center"
          >
            <Text className="text-white/60">
              {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={{ color: '#00c2ff' }}>
                {mode === 'signup' ? 'Log in' : 'Sign up'}
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Terms (signup only) */}
          {mode === 'signup' && (
            <Text className="text-white/40 text-xs text-center mt-6">
              By creating an account, you agree to our{' '}
              <Text className="text-white/60 underline">Terms of Service</Text> and{' '}
              <Text className="text-white/60 underline">Privacy Policy</Text>
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

2. **Update `app/login.tsx`:**
```jsx
import { AuthScreen } from '@/components/AuthScreen';

export default function LoginScreen() {
  return <AuthScreen mode="login" />;
}
```

3. **Update `app/signup.tsx`:**
```jsx
import { AuthScreen } from '@/components/AuthScreen';

export default function SignupScreen() {
  return <AuthScreen mode="signup" />;
}
```

**Key Points:**
- Use existing `useSession()` hook for all auth methods
- `signInWithGoogle()`, `signInWithApple()`, `signInWithMagicLink()` are already implemented
- Navigate to `/(tabs)` after successful auth (handled in auth context)
- Show/hide password toggle with eye icon
- Social buttons in a row (3 buttons)

---

### ✅ Phase 2: Main App Structure

#### Task 2.1: Create Bottom Tab Navigation
**File:** `app/(tabs)/_layout.tsx`

**Reference:** `ReactProjectFiles/src/App.tsx` (bottom nav section)

**Steps:**

1. Update `app/(tabs)/_layout.tsx`:
```jsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00c2ff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 48,
          right: 48,
          backgroundColor: 'rgba(39, 39, 42, 0.9)',
          borderRadius: 9999,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 80 : 70,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="home" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: 'Challenges',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="trophy" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="person" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

2. Create tab screen files:
   - `app/(tabs)/index.tsx` - Home feed
   - `app/(tabs)/challenges.tsx` - Challenge list
   - `app/(tabs)/profile.tsx` - User profile

---

#### Task 2.2: Create Home Feed Screen
**File:** `app/(tabs)/index.tsx`

**Reference:** `ReactProjectFiles/src/components/HomePage.tsx`

**This is a complex screen. Break it down:**

**Components to create first:**
1. `components/PostCard.tsx` - Individual post card
2. `components/NotificationBell.tsx` - Bell icon with badge
3. `components/NotificationsModal.tsx` - Notifications bottom sheet
4. `components/ChallengePreviewModal.tsx` - Challenge preview sheet
5. `components/GivePointsModal.tsx` - Give points sheet
6. `components/GroupInfoModal.tsx` - Group info sheet

**PostCard Component Structure:**
```jsx
// components/PostCard.tsx
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PostCardProps {
  post: {
    id: string;
    user: { name: string; avatar: string; streak: number };
    challenge: { id: string; name: string };
    group?: { name: string; logo: string; color: string };
    type: 'success' | 'fail';
    message: string;
    note?: string;
    image?: string;
    timestamp: string;
    likes: number;
    abilityPointsGiven: number;
  };
  onChallengeClick: (challengeId: string) => void;
  onGivePoints: (post: any) => void;
  onGroupClick?: (group: any) => void;
}

export function PostCard({ post, onChallengeClick, onGivePoints, onGroupClick }: PostCardProps) {
  return (
    <View className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden mb-4">
      {/* Success/Fail Ribbon - Top Right Corner */}
      <View style={{ position: 'absolute', top: 0, right: 0, zIndex: 10, width: 96, height: 96, overflow: 'hidden' }}>
        <View 
          style={{
            position: 'absolute',
            top: 20,
            right: -40,
            width: 160,
            transform: [{ rotate: '45deg' }],
            paddingVertical: 4,
            backgroundColor: post.type === 'success' ? '#00c2ff' : '#ef4444',
          }}
        >
          <Text className="text-black text-xs text-center font-bold uppercase">
            {post.type === 'success' ? '✓ Done' : '✗ Failed'}
          </Text>
        </View>
      </View>

      {/* Group Banner (if exists) */}
      {post.group && (
        <TouchableOpacity 
          onPress={() => onGroupClick?.(post.group)}
          style={{ backgroundColor: post.group.color }}
          className="p-3 border-b border-white/10"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-white items-center justify-center">
              <Text className="text-2xl">{post.group.logo}</Text>
            </View>
            <View>
              <Text className="text-white text-xs">Challenge by</Text>
              <Text className="text-white font-bold">{post.group.name}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      <View className="p-5">
        {/* User Header */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center gap-3">
            <Image 
              source={{ uri: post.user.avatar }} 
              style={{ width: 48, height: 48, borderRadius: 24 }}
            />
            <View>
              <View className="flex-row items-center gap-2">
                <Text className="text-white font-bold">{post.user.name}</Text>
                <View className="bg-white/10 px-2 py-1 rounded-full">
                  <Text className="text-white text-xs">{post.user.streak}🔥</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => onChallengeClick(post.challenge.id)}>
                <Text className="text-white/60 text-sm underline">
                  {post.challenge.name}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Post Content */}
        <Text className="text-white mb-3">{post.message}</Text>
        {post.note && (
          <Text className="text-white/60 text-sm italic mb-3">{post.note}</Text>
        )}

        {/* Post Image */}
        {post.image && (
          <View className="rounded-xl overflow-hidden mb-3 border-2 border-white/10">
            <Image 
              source={{ uri: post.image }} 
              style={{ width: '100%', height: 256 }}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Actions */}
        <View className="flex-row items-center gap-6 pt-3 border-t border-white/10">
          <TouchableOpacity className="flex-row items-center gap-2">
            <Ionicons name="heart-outline" size={20} color="rgba(255,255,255,0.6)" />
            <Text className="text-white/60 text-sm">{post.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => onGivePoints(post)}
            className="flex-row items-center gap-2"
          >
            <Ionicons name="trophy-outline" size={20} color="rgba(255,255,255,0.6)" />
            <Text className="text-white/60 text-sm">Give Points</Text>
          </TouchableOpacity>
          {post.abilityPointsGiven > 0 && (
            <View 
              style={{ backgroundColor: '#00c2ff20' }}
              className="flex-row items-center gap-1 px-2 py-1 rounded-full"
            >
              <Ionicons name="trending-up" size={16} color="#00c2ff" />
              <Text style={{ color: '#00c2ff' }} className="text-sm">
                +{post.abilityPointsGiven} AP
              </Text>
            </View>
          )}
          <Text className="text-white/40 text-xs ml-auto">{post.timestamp}</Text>
        </View>
      </View>
    </View>
  );
}
```

**Main Home Screen:**
```jsx
// app/(tabs)/index.tsx
import { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PostCard } from '@/components/PostCard';
import { NotificationsModal } from '@/components/NotificationsModal';
import { ChallengePreviewModal } from '@/components/ChallengePreviewModal';
import { GivePointsModal } from '@/components/GivePointsModal';
import { GroupInfoModal } from '@/components/GroupInfoModal';
import { router } from 'expo-router';

// Mock data (replace with Supabase queries later)
const feedPosts = [/* ... */];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<'all' | 'my-challenges'>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [givePointsPost, setGivePointsPost] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const filteredPosts = activeTab === 'all' ? feedPosts : feedPosts.filter(/* ... */);

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Top Navigation */}
      <View className="px-4 py-4 border-b border-white/10">
        <View className="flex-row items-center justify-between">
          <Image 
            source={require('@/assets/logo.png')} 
            style={{ width: 160, height: 40 }}
          />
          <TouchableOpacity 
            onPress={() => setShowNotifications(true)}
            className="relative"
          >
            <Ionicons name="notifications-outline" size={24} color="white" />
            {/* Unread badge */}
            <View 
              style={{ backgroundColor: '#00c2ff' }}
              className="absolute top-0 right-0 w-2 h-2 rounded-full"
            />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2 mt-4">
          <TouchableOpacity 
            onPress={() => setActiveTab('all')}
            style={{ backgroundColor: activeTab === 'all' ? '#00c2ff' : 'rgba(255,255,255,0.05)' }}
            className="flex-1 py-2 rounded-lg border border-white/10"
          >
            <Text className={activeTab === 'all' ? 'text-black text-center font-bold' : 'text-white/60 text-center'}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('my-challenges')}
            style={{ backgroundColor: activeTab === 'my-challenges' ? '#00c2ff' : 'rgba(255,255,255,0.05)' }}
            className="flex-1 py-2 rounded-lg border border-white/10"
          >
            <Text className={activeTab === 'my-challenges' ? 'text-black text-center font-bold' : 'text-white/60 text-center'}>
              My Challenges
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        {filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onChallengeClick={(id) => {
              setSelectedChallenge(feedPosts.find(p => p.challenge.id === id)?.challenge);
            }}
            onGivePoints={(post) => setGivePointsPost(post)}
            onGroupClick={(group) => setSelectedGroup(group)}
          />
        ))}
      </ScrollView>

      {/* Modals */}
      <NotificationsModal 
        visible={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      <ChallengePreviewModal 
        challenge={selectedChallenge} 
        onClose={() => setSelectedChallenge(null)}
        onViewChallenge={() => router.push(`/challenge/${selectedChallenge?.id}`)}
      />
      <GivePointsModal 
        post={givePointsPost} 
        onClose={() => setGivePointsPost(null)} 
      />
      <GroupInfoModal 
        group={selectedGroup} 
        onClose={() => setSelectedGroup(null)} 
      />
    </SafeAreaView>
  );
}
```

**Notes:**
- Create each modal component separately
- Use React Native `<Modal>` for all bottom sheets
- Implement slide-up animation with `animationType="slide"`
- Add close button or swipe-down gesture

---

#### Task 2.3: Create Challenge List Screen
**File:** `app/(tabs)/challenges.tsx`

**Reference:** `ReactProjectFiles/src/components/ChallengeList.tsx`

**Steps:**
1. Create `components/ChallengeCard.tsx` for individual challenge cards
2. Implement search bar with filter buttons
3. Grid layout with 2 columns
4. Floating "+" button (bottom right) to navigate to `/challenge/create`
5. Each card shows:
   - Challenge image
   - Title
   - Type badge
   - Stats (members, days, completion %)
   - Progress indicator

```jsx
// app/(tabs)/challenges.tsx
import { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ChallengeCard } from '@/components/ChallengeCard';
import { router } from 'expo-router';

export default function ChallengesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'personal' | 'team' | 'group'>('all');

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="px-4 py-4 border-b border-white/10">
        <Text className="text-white text-2xl font-bold mb-4">Challenges</Text>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-white/5 border border-white/20 rounded-xl px-4 py-3 mb-4">
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search challenges..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            className="flex-1 text-white ml-3"
          />
        </View>

        {/* Filter Buttons */}
        <View className="flex-row gap-2">
          {['all', 'personal', 'team', 'group'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f as any)}
              style={{ backgroundColor: filter === f ? '#00c2ff' : 'rgba(255,255,255,0.05)' }}
              className="px-4 py-2 rounded-lg border border-white/10"
            >
              <Text className={filter === f ? 'text-black font-bold capitalize' : 'text-white/60 capitalize'}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Challenge Grid */}
      <ScrollView className="flex-1 px-4 py-6">
        <View className="flex-row flex-wrap gap-4">
          {mockChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onPress={() => router.push(`/challenge/${challenge.id}`)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating Create Button */}
      <TouchableOpacity
        onPress={() => router.push('/challenge/create')}
        style={{ backgroundColor: '#00c2ff', position: 'absolute', bottom: 100, right: 24 }}
        className="w-14 h-14 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={32} color="black" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
```

---

#### Task 2.4: Create Profile Screen
**File:** `app/(tabs)/profile.tsx`

**Reference:** `ReactProjectFiles/src/components/Profile.tsx`

**Steps:**
1. User avatar (editable with image picker)
2. Name, username, bio
3. Stats cards (3 columns)
4. Recent posts feed
5. Settings button (navigate to `/settings`)

```jsx
// app/(tabs)/profile.tsx
import { View, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/context';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user } = useSession();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView>
        {/* Header */}
        <View className="items-center py-8">
          <TouchableOpacity>
            <Image
              source={{ uri: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default' }}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
            <View 
              style={{ backgroundColor: '#00c2ff', position: 'absolute', bottom: 0, right: 0 }}
              className="w-8 h-8 rounded-full items-center justify-center border-2 border-black"
            >
              <Ionicons name="camera" size={16} color="black" />
            </View>
          </TouchableOpacity>

          <Text className="text-white text-2xl font-bold mt-4">{user?.display_name || 'User'}</Text>
          <Text className="text-white/60">@{user?.username || 'username'}</Text>
          <Text className="text-white/70 text-center mt-2 px-8">
            {user?.bio || 'No bio yet'}
          </Text>
        </View>

        {/* Stats */}
        <View className="flex-row px-4 gap-2 mb-6">
          <View className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 items-center">
            <Text className="text-3xl font-bold" style={{ color: '#00c2ff' }}>15</Text>
            <Text className="text-white/60 text-sm">Streaks</Text>
          </View>
          <View className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 items-center">
            <Text className="text-3xl font-bold" style={{ color: '#00c2ff' }}>245</Text>
            <Text className="text-white/60 text-sm">Ability Points</Text>
          </View>
          <View className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 items-center">
            <Text className="text-3xl font-bold" style={{ color: '#00c2ff' }}>3</Text>
            <Text className="text-white/60 text-sm">Completed</Text>
          </View>
        </View>

        {/* Settings Button */}
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          className="mx-4 mb-6 bg-white/5 border border-white/10 rounded-xl p-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="settings-outline" size={24} color="white" />
            <Text className="text-white font-medium">Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        {/* Recent Activity */}
        <View className="px-4">
          <Text className="text-white text-xl font-bold mb-4">Recent Activity</Text>
          {/* Show user's recent posts */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

### ✅ Phase 3: Challenge Screens

#### Task 3.1: Challenge Details Screen
**File:** `app/challenge/[id].tsx`

**Reference:** `ReactProjectFiles/src/components/ChallengeDetails.tsx`

**This screen has 3 tabs:**
1. Task Tracker
2. Leaderboard
3. Messages

Use `@react-navigation/material-top-tabs` or custom tab implementation.

```jsx
// app/challenge/[id].tsx
import { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TaskTrackerTab } from '@/components/challenge-tabs/TaskTrackerTab';
import { LeaderboardTab } from '@/components/challenge-tabs/LeaderboardTab';
import { MessagesTab } from '@/components/challenge-tabs/MessagesTab';

export default function ChallengeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'tasks' | 'leaderboard' | 'messages'>('tasks');

  // Fetch challenge data from Supabase using id
  const challenge = {/* ... */};

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="relative">
        <Image
          source={{ uri: challenge.image }}
          style={{ width: '100%', height: 200 }}
        />
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(0,0,0,0.5)' }}
          className="w-10 h-10 rounded-full items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
          <Text className="text-white text-2xl font-bold">{challenge.title}</Text>
          <View className="flex-row items-center gap-2 mt-2">
            <View style={{ backgroundColor: '#00c2ff' }} className="px-3 py-1 rounded-full">
              <Text className="text-black text-xs font-bold uppercase">{challenge.type}</Text>
            </View>
            <Text className="text-white/60">{challenge.members} members</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-white/10">
        {['tasks', 'leaderboard', 'messages'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab as any)}
            className="flex-1 py-4"
            style={{ borderBottomWidth: activeTab === tab ? 2 : 0, borderBottomColor: '#00c2ff' }}
          >
            <Text className={activeTab === tab ? 'text-white text-center font-bold' : 'text-white/60 text-center capitalize'}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View className="flex-1">
        {activeTab === 'tasks' && <TaskTrackerTab challengeId={id as string} />}
        {activeTab === 'leaderboard' && <LeaderboardTab challengeId={id as string} />}
        {activeTab === 'messages' && <MessagesTab challengeId={id as string} />}
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2 p-4 border-t border-white/10">
        <TouchableOpacity
          style={{ backgroundColor: '#00c2ff' }}
          className="flex-1 py-4 rounded-xl items-center"
        >
          <Text className="text-black font-bold">Mark Complete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#ef4444' }}
          className="flex-1 py-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold">Admit Failure</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
```

Create separate tab components in `components/challenge-tabs/`:
- `TaskTrackerTab.tsx` - Daily checklist with checkboxes
- `LeaderboardTab.tsx` - Ranked list with scores
- `MessagesTab.tsx` - Chat/comment list

---

#### Task 3.2: Create Challenge Wizard
**File:** `app/challenge/create.tsx`

**Reference:** `ReactProjectFiles/src/components/CreateChallenge.tsx` (1139 lines!)

**This is a 4-step wizard. Break it into components:**

1. `components/create-challenge/Step1Basics.tsx`
2. `components/create-challenge/Step2Tasks.tsx`
3. `components/create-challenge/Step3InviteUsers.tsx`
4. `components/create-challenge/Step4CreateTeams.tsx`

**Main wizard:**
```jsx
// app/challenge/create.tsx
import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Step1Basics } from '@/components/create-challenge/Step1Basics';
import { Step2Tasks } from '@/components/create-challenge/Step2Tasks';
import { Step3InviteUsers } from '@/components/create-challenge/Step3InviteUsers';
import { Step4CreateTeams } from '@/components/create-challenge/Step4CreateTeams';

export default function CreateChallengeScreen() {
  const [step, setStep] = useState(1);
  const [challengeData, setChallengeData] = useState({});

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    else {
      // Save to Supabase
      router.back();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Progress Indicator */}
      <View className="flex-row px-4 py-6">
        {[1, 2, 3, 4].map((s) => (
          <View key={s} className="flex-1 h-1 mx-1" style={{ backgroundColor: s <= step ? '#00c2ff' : 'rgba(255,255,255,0.2)' }} />
        ))}
      </View>

      {/* Step Content */}
      {step === 1 && <Step1Basics data={challengeData} onUpdate={setChallengeData} />}
      {step === 2 && <Step2Tasks data={challengeData} onUpdate={setChallengeData} />}
      {step === 3 && <Step3InviteUsers data={challengeData} onUpdate={setChallengeData} />}
      {step === 4 && <Step4CreateTeams data={challengeData} onUpdate={setChallengeData} />}

      {/* Navigation Buttons */}
      <View className="flex-row gap-2 p-4 border-t border-white/10">
        <TouchableOpacity
          onPress={prevStep}
          className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl items-center"
        >
          <Text className="text-white font-bold">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={nextStep}
          style={{ backgroundColor: '#00c2ff' }}
          className="flex-1 py-4 rounded-xl items-center"
        >
          <Text className="text-black font-bold">
            {step === 4 ? 'Create Challenge' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
```

Each step component should:
- Accept `data` and `onUpdate` props
- Render form inputs for that step
- Validate inputs before allowing next step

---

#### Task 3.3: Settings Screen
**File:** `app/settings.tsx`

**Reference:** `ReactProjectFiles/src/components/SettingsPage.tsx`

**Simple screen with grouped settings rows:**

```jsx
// app/settings.tsx
import { View, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSession } from '@/context';

export default function SettingsScreen() {
  const { signOut } = useSession();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView>
        {/* Header */}
        <View className="flex-row items-center px-4 py-4 border-b border-white/10">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-4">Settings</Text>
        </View>

        {/* Settings Groups */}
        <View className="px-4 py-6 space-y-6">
          {/* Notifications */}
          <View>
            <Text className="text-white/60 text-sm mb-3">NOTIFICATIONS</Text>
            <View className="bg-white/5 border border-white/10 rounded-xl">
              <View className="flex-row items-center justify-between px-4 py-4">
                <Text className="text-white">Push Notifications</Text>
                <Switch />
              </View>
            </View>
          </View>

          {/* Account */}
          <View>
            <Text className="text-white/60 text-sm mb-3">ACCOUNT</Text>
            <View className="bg-white/5 border border-white/10 rounded-xl">
              <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 border-b border-white/10">
                <Text className="text-white">Edit Profile</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
                <Text className="text-white">Privacy Settings</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* About */}
          <View>
            <Text className="text-white/60 text-sm mb-3">ABOUT</Text>
            <View className="bg-white/5 border border-white/10 rounded-xl">
              <TouchableOpacity className="flex-row items-center justify-between px-4 py-4 border-b border-white/10">
                <Text className="text-white">Terms of Service</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
                <Text className="text-white">Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={signOut}
            className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-4 items-center"
          >
            <Text className="text-red-500 font-bold">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

## Data Integration with Supabase

### Fetching Data Example:

```jsx
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { useSession } from '@/context';

export function useChallenges() {
  const { user } = useSession();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  async function fetchChallenges() {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChallenges(data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  }

  return { challenges, loading, refetch: fetchChallenges };
}
```

### Creating Data Example:

```jsx
async function createChallenge(challengeData) {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        title: challengeData.title,
        description: challengeData.description,
        type: challengeData.type,
        duration: challengeData.duration,
        duration_type: challengeData.durationType,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating challenge:', error);
    Alert.alert('Error', 'Failed to create challenge');
  }
}
```

---

## Testing Checklist

After completing each screen, test:

### Functionality
- [ ] All buttons navigate correctly
- [ ] Forms validate input
- [ ] Data loads from Supabase
- [ ] Data saves to Supabase
- [ ] Auth flows work (login, signup, logout)
- [ ] Navigation stack works properly

### UI/UX
- [ ] Colors match design (#00c2ff primary)
- [ ] Fonts and spacing consistent
- [ ] Safe areas respected (no content under notch)
- [ ] Keyboard dismisses on scroll
- [ ] Loading states shown
- [ ] Error messages displayed

### Performance
- [ ] Images load efficiently
- [ ] Smooth scrolling
- [ ] No memory leaks
- [ ] Fast navigation transitions

### Cross-Platform
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Handle platform-specific UI differences

---

## Common Issues & Solutions

### Issue: Text not rendering
**Solution:** Wrap all text in `<Text>` components, not `<View>`

### Issue: Images not showing
**Solution:** Specify explicit width and height in style prop

### Issue: Bottom navigation hidden behind tab bar
**Solution:** Add `paddingBottom` to screen content or use `KeyboardAvoidingView`

### Issue: Modal not closing
**Solution:** Ensure `onRequestClose` is handled properly

### Issue: Auth not working
**Solution:** Check Supabase is initialized and auth context is wrapped around app

### Issue: Navigation not working
**Solution:** Verify file-based routing in `app/` folder matches navigation paths

---

## Final Notes

1. **Start with Priority 1** (Onboarding & Auth) and test thoroughly before moving on
2. **Use existing components** in the RN project where possible (Button, FormInput, Avatar, etc.)
3. **Test on real devices** after implementing main features
4. **Optimize performance** with `React.memo`, `useMemo`, `useCallback` where needed
5. **Add loading states** for all async operations
6. **Handle errors gracefully** with user-friendly messages
7. **Add haptic feedback** with `expo-haptics` for button presses
8. **Test offline behavior** and show appropriate messages

---

## Resources for AI Agents

When stuck, refer to:
- React Native Docs: https://reactnative.dev/docs/getting-started
- Expo Router Docs: https://docs.expo.dev/router/introduction/
- NativeWind Docs: https://www.nativewind.dev/
- Supabase JS Docs: https://supabase.com/docs/reference/javascript/introduction
- React Navigation Docs: https://reactnavigation.org/docs/getting-started

---

**Remember:** The React project is fully functional. Your job is to recreate each screen's UI and functionality in React Native while using the existing Supabase auth context and following React Native best practices.

Start with `Task 1.1: Update Onboarding Screen` and work through systematically. Good luck! 🚀
