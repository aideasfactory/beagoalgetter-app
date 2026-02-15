# Challenge Details Screen - Test Guide

## Quick Test Instructions

### 1. Create Test Navigation (Temporary)

Add a test button to navigate to the Challenge Details screen.

**In `app/(tabs)/index.tsx` or any test screen:**

```tsx
import { TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';

// Add this button somewhere visible
<TouchableOpacity
  onPress={() => router.push('/challenge/c123')}
  className="bg-cyan-500 p-4 rounded-xl m-4"
>
  <Text className="text-black font-bold text-center">
    Test Challenge Details
  </Text>
</TouchableOpacity>
```

### 2. Test Checklist

#### Visual Tests ✓
- [ ] Hero image displays correctly (480px height)
- [ ] Gradient overlay is visible (darker at edges)
- [ ] Back button (←) visible in top-left
- [ ] Share button (⊙) visible in top-right
- [ ] Challenge title is large and bold
- [ ] Badge shows "Group • 12 members"
- [ ] 4 stat cards display at bottom of hero
  - [ ] Streak (cyan, 15)
  - [ ] Points (green, 1250)
  - [ ] Members (purple, 12)
  - [ ] Days Remaining (orange, 15)
- [ ] Progress bar shows 50% filled (cyan)
- [ ] Progress text shows "15/30 days"
- [ ] Description text is readable
- [ ] 3 tabs visible (Tasks, Leaderboard, Messages)
- [ ] Bottom buttons fixed at bottom
  - [ ] "Mark Complete" (cyan)
  - [ ] "Admit Failure" (red)

#### Interaction Tests ✓
- [ ] **Back Button**
  - Tap back button → returns to previous screen
  - Should work smoothly

- [ ] **Share Button**
  - Tap share button → alert appears
  - Alert says "Share functionality coming soon!"

- [ ] **Tab Switching**
  - Tap "Tasks" → TaskTrackerTab appears
    - Should see task checklist with streak info
  - Tap "Leaderboard" → LeaderboardTab appears
    - Should see team standings and podium
  - Tap "Messages" → MessagesTab appears
    - Should see admin messages list
  - Active tab has cyan bottom border
  - Icon color changes (white when active, grey when inactive)

- [ ] **Scrolling**
  - Scroll down → hero section scrolls away
  - Bottom buttons stay fixed (don't scroll)
  - Tab content scrolls smoothly
  - No content hidden behind buttons

- [ ] **Action Buttons**
  - Tap "Mark Complete" → alert appears
    - Title: "Mark Complete"
    - Message: "Are you sure you want to mark today as complete?"
    - Buttons: Cancel, Complete
  - Tap "Admit Failure" → alert appears
    - Title: "Admit Failure"
    - Message: "It's okay to fail sometimes. Being honest keeps you accountable."
    - Buttons: Cancel, Mark Failed (red)

#### Safe Area Tests ✓
- [ ] Top buttons respect status bar (not hidden)
- [ ] Bottom buttons respect home indicator (not hidden)
- [ ] Content doesn't overlap with notch/camera
- [ ] Safe on both iOS and Android

#### Tab Content Tests ✓

**Tasks Tab:**
- [ ] Current streak displays (15 days)
- [ ] Today's progress shows (2/4)
- [ ] 4 tasks listed
- [ ] Tasks can be toggled
- [ ] Photo upload area visible
- [ ] Notes textarea visible
- [ ] Submit button at bottom

**Leaderboard Tab:**
- [ ] Team standings section visible
- [ ] 3 teams displayed
- [ ] Individual leaderboard with top 3 podium
- [ ] Remaining participants in list
- [ ] Can tap teams to see details modal

**Messages Tab:**
- [ ] Info alert at top
- [ ] 5 admin messages displayed
- [ ] Different message types styled differently
- [ ] Admin avatar and role badge visible
- [ ] Timestamps visible

### 3. Navigation Flow Test

```
Start → Tap test button → Challenge Details
  │
  ├─→ Tap back button → Returns to start ✓
  │
  ├─→ Tap Tasks tab → See tasks ✓
  │
  ├─→ Tap Leaderboard tab → See rankings ✓
  │
  ├─→ Tap Messages tab → See messages ✓
  │
  └─→ Tap Mark Complete → See alert ✓
```

### 4. Different Screen Sizes

Test on various devices:
- [ ] iPhone SE (small)
- [ ] iPhone 14 (standard)
- [ ] iPhone 14 Pro Max (large)
- [ ] iPad (tablet)
- [ ] Android phone
- [ ] Android tablet

### 5. Performance Test

- [ ] Screen loads quickly (<1s)
- [ ] Tab switching is instant
- [ ] Scrolling is smooth (60fps)
- [ ] No lag when tapping buttons
- [ ] Hero image loads progressively
- [ ] No memory leaks

### 6. Error Scenarios

Test with different data:
- [ ] Long challenge title (wraps correctly)
- [ ] Long description (scrolls correctly)
- [ ] Missing image (shows placeholder or error)
- [ ] 0 days remaining (displays correctly)
- [ ] Very high streak number (999+) (displays correctly)

---

## Expected Behavior Summary

### When Screen Loads:
1. Hero image appears with gradient
2. Challenge info overlays on image
3. Stats cards display at bottom
4. Progress bar shows filled percentage
5. "Tasks" tab is active by default
6. TaskTrackerTab content loads

### When Switching Tabs:
1. Active tab border turns cyan
2. Previous content disappears
3. New tab content appears instantly
4. No flicker or flash
5. Scroll position resets to top

### When Scrolling:
1. Hero section scrolls up and away
2. Tabs may become sticky (optional)
3. Bottom buttons always visible
4. Smooth scrolling, no jumps

### When Tapping Actions:
1. Alert appears with correct text
2. Alert has correct buttons
3. Tapping "Cancel" dismisses alert
4. Tapping action button logs to console (for now)

---

## Common Issues

### Issue: Hero image not showing
**Check:**
- Image URL is valid
- Internet connection works
- expo-image is installed

### Issue: Back button doesn't work
**Check:**
- router.back() is called
- There is a previous screen to go back to
- Test by navigating from another screen first

### Issue: Tabs don't switch
**Check:**
- State is updating (add console.log)
- Tab components are imported correctly
- activeTab matches component condition

### Issue: Bottom buttons hidden
**Check:**
- ScrollView has bottom padding (100px)
- Fixed positioning is correct
- SafeAreaView is working

### Issue: Content overlaps with notch
**Check:**
- SafeAreaView is imported from 'react-native-safe-area-context'
- edges prop is set correctly
- Library is installed

---

## Quick Fixes

### Add Console Logs for Debugging
```tsx
// In component
console.log('Challenge ID:', id);
console.log('Active Tab:', activeTab);

// In button handlers
const handleMarkComplete = () => {
  console.log('Mark Complete tapped');
  // ...
};
```

### Add Loading State
```tsx
if (!challenge) {
  return (
    <View className="flex-1 bg-black items-center justify-center">
      <Text className="text-white">Loading challenge...</Text>
    </View>
  );
}
```

### Add Error Boundary
```tsx
if (error) {
  return (
    <View className="flex-1 bg-black items-center justify-center p-4">
      <Text className="text-white text-lg mb-4">Failed to load challenge</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text className="text-cyan-500">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## Acceptance Criteria

The Challenge Details screen is ready when:

✅ All visual elements match the design  
✅ All tabs switch correctly  
✅ All buttons work as expected  
✅ Navigation works (back button)  
✅ Safe areas are respected  
✅ Scrolling is smooth  
✅ No console errors  
✅ Works on iOS and Android  
✅ Tab content loads from components  
✅ Actions show alerts correctly  

---

## Next Steps After Testing

1. **If all tests pass:**
   - Integrate with Supabase
   - Replace mock data with real data
   - Add loading states
   - Add error handling

2. **If issues found:**
   - Document the issue
   - Check console for errors
   - Review component code
   - Test in isolation

3. **Ready to proceed:**
   - Create Challenge List screen
   - Add navigation from list to details
   - Test full flow
   - Deploy to TestFlight/Google Play

---

## Test Result Template

```
Date: ___________
Tester: ___________
Device: ___________

Visual Tests: __ / 15 passed
Interaction Tests: __ / 12 passed
Safe Area Tests: __ / 4 passed
Tab Content Tests: __ / 15 passed

Issues Found:
1. ______________________________
2. ______________________________
3. ______________________________

Notes:
_________________________________
_________________________________
_________________________________

Status: ☐ Pass  ☐ Fail  ☐ Needs Work
```
