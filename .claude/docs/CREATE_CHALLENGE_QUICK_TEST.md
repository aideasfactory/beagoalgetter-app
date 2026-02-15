# Create Challenge Wizard - Quick Test Guide

## ⚡ Quick Start

### Open the Wizard
1. Open app
2. Tap "Challenges" tab (trophy icon)
3. Tap the **+** button (floating button, bottom-right)
4. ✅ Create Challenge wizard opens!

---

## 🧪 Test Scenarios

### Scenario 1: Personal Challenge (Fast Test)
**Time:** ~2 minutes

```
Step 1: Basic Info
✓ Title: "Morning Routine"
✓ Description: "Start day with meditation"
✓ Duration: 21 days
✓ Type: Personal ← Select this
✓ Tap Next

Step 2: Tasks
✓ Task 1: "10 min meditation"
✓ Make it recurring: Mon, Wed, Fri
✓ Tap "Add Another Task"
✓ Task 2: "Morning stretches"
✓ Tap Next

Step 3 is skipped (Personal type)

✅ Tap "Create Challenge"
✅ Success alert appears!
```

---

### Scenario 2: Group Challenge (Medium Test)
**Time:** ~3 minutes

```
Step 1: Basic Info
✓ Title: "City Runners Club"
✓ Description: "Train together for the marathon"
✓ Duration: 8 weeks ← Try weeks!
✓ Type: Group ← Select this
✓ Select Group: "Boro Runners"
✓ Tap image upload (optional)
✓ Tap Next

Step 2: Tasks
✓ Task: "5km run"
✓ Toggle recurring: All 7 days
✓ Tap Next

Step 3: Invite Users
✓ Search "Sarah"
✓ Tap Sarah Johnson (checkbox selected)
✓ Search "Mike"
✓ Tap Mike Chen
✓ Tap "Select All" to select everyone
✓ Tap "Deselect All" to clear
✓ Manually select 3-4 users
✓ Tap Next

✅ Tap "Create Challenge"
✅ Success!
```

---

### Scenario 3: Team Challenge (Full Test)
**Time:** ~5 minutes

```
Step 1: Basic Info
✓ Title: "Q4 Sales Battle"
✓ Description: "Compete in teams"
✓ Duration: 30 days
✓ Type: Team ← Important!
✓ Tap Next

Step 2: Tasks
✓ Task 1: "Make 10 calls"
✓ Task 2: "Close 2 deals"
✓ Make both recurring: Mon-Fri
✓ Tap Next

Step 3: Invite Users
✓ Select 6 users (need at least 6 for 3 teams)
✓ Tap Next

Step 4: Create Teams ← NEW STEP!
✓ Tap "Create Team"
  - Name: "Team Alpha"
  - Color: Cyan
  - Create
✓ Tap "Create Team"
  - Name: "Team Beta"
  - Color: Orange
  - Create
✓ Tap "Create Team"
  - Name: "Team Gamma"
  - Color: Purple
  - Create
✓ Tap + on Team Alpha
  - Select 2 users
✓ Tap + on Team Beta
  - Select 2 users
✓ Tap + on Team Gamma
  - Select remaining 2 users
✓ All users assigned! ✅

✅ Tap "Create Challenge"
✅ Teams created!
```

---

## 🔍 What to Verify

### Step 1 (Basic Info)
- [ ] Can type in all fields
- [ ] Days/Weeks toggle works
- [ ] Type selector shows 3 options (Personal/Team/Group)
- [ ] Selected type is highlighted (cyan border)
- [ ] Group selector appears only for Group type
- [ ] Image upload opens photo picker
- [ ] Uploaded image shows with X to remove
- [ ] Next validates required fields

### Step 2 (Tasks)
- [ ] Can add multiple tasks
- [ ] Can delete tasks (except if only 1)
- [ ] Recurring toggle works (iOS style)
- [ ] Day pills appear when recurring is on
- [ ] Can select/deselect days
- [ ] "Use PDF" toggle shows PDF upload screen
- [ ] Can toggle back to task list
- [ ] Next validates at least 1 task with title

### Step 3 (Invite Users)
- [ ] Search filters users in real-time
- [ ] Clear button appears when typing
- [ ] Can select/deselect users
- [ ] Selected users show cyan border + background
- [ ] Checkbox updates correctly
- [ ] "Select All" selects all visible users
- [ ] "Deselect All" clears all
- [ ] Selected count updates
- [ ] Shows "No users found" if search returns nothing
- [ ] Next validates participants (if not Personal)

### Step 4 (Teams)
- [ ] Only shows for Team challenge type
- [ ] "Create Team" button opens modal
- [ ] Can enter team name
- [ ] Can pick from 8 colors
- [ ] Create button adds team to list
- [ ] Team shows color, name, member count
- [ ] Can tap + to assign users
- [ ] Assign modal shows unassigned users
- [ ] Can remove users from teams
- [ ] Can delete teams
- [ ] Unassigned users list shows at bottom
- [ ] Next validates: 2+ teams, all users assigned

### Navigation
- [ ] Progress bars update correctly
- [ ] Step counter shows "Step X of Y"
- [ ] Back button goes to previous step
- [ ] Next button advances (after validation)
- [ ] X button shows confirmation
- [ ] Back on Step 1 shows discard confirmation
- [ ] Data persists when going back/forward
- [ ] Final button says "Create Challenge"

### Validation Alerts
- [ ] Empty title → Alert
- [ ] Empty description → Alert
- [ ] Invalid duration → Alert
- [ ] Group type without group → Alert
- [ ] No tasks → Alert
- [ ] No participants (if not Personal) → Alert
- [ ] Less than 2 teams → Alert
- [ ] Unassigned users → Alert

### Success Flow
- [ ] Success alert appears
- [ ] Can choose "View Challenge" or "OK"
- [ ] Navigates back to Challenges list
- [ ] No errors in console

---

## 🐛 Common Issues to Check

### Issue: Can't tap Next
**Check:** Is a required field empty? Read the alert.

### Issue: Step 4 doesn't appear
**Check:** Challenge type must be "Team" (not Personal or Group).

### Issue: Can't create challenge
**Check:** Are all users assigned to teams? Any alerts?

### Issue: Image picker doesn't open
**Check:** App needs rebuild for photo permissions.

### Issue: Data lost when going back
**Check:** That's a bug - data should persist. Report it.

---

## ✅ Success Criteria

Wizard is working correctly if:

✓ All 4 steps are accessible  
✓ Forms accept input correctly  
✓ Validation prevents invalid data  
✓ Data persists across steps  
✓ Step 4 shows only for Team type  
✓ Personal type skips Step 3 → Create  
✓ Success alert appears on create  
✓ Navigates to challenges list  

---

## 📊 Test Matrix

| Type | Steps | Participants | Teams |
|------|-------|-------------|-------|
| Personal | 1 → 2 → Create | No (skipped) | No |
| Group | 1 → 2 → 3 → Create | Yes (required) | No |
| Team | 1 → 2 → 3 → 4 → Create | Yes (required) | Yes (required) |

---

## 🎯 Edge Cases

- [ ] **Single task:** Can't delete
- [ ] **Empty search:** Shows empty state
- [ ] **Personal + users:** Participants optional
- [ ] **Team without users:** Can't proceed past Step 3
- [ ] **Odd number of users:** Can still create teams
- [ ] **Same user in multiple teams:** Not possible (removed from first)
- [ ] **Delete team with members:** Members become unassigned
- [ ] **Very long title:** Truncates nicely
- [ ] **0 duration:** Shows validation error

---

## 🚀 Quick Test Commands

```bash
# If you need to rebuild (for image picker)
npx expo run:ios
# or
npx expo run:android
```

---

## Status: Ready to Test! ✅

Everything is implemented and ready. Start testing now:
1. Tap Challenges tab
2. Tap + button
3. Have fun creating challenges! 🎉
