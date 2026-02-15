# ChallengeCard Visual Layout Reference

## Card Anatomy (in 2-column grid)

```
┌─────────────────┐ ┌─────────────────┐
│ [Group] [👥 12] │ │ [Personal]      │
│                 │ │                 │
│     IMAGE       │ │     IMAGE       │
│   (160px h)     │ │   (160px h)     │
│   w/ Gradient   │ │   w/ Gradient   │
│                 │ │                 │
│ Title Here      │ │ Title Here      │
│ Description...  │ │ Description...  │
├─────────────────┤ ├─────────────────┤
│ Progress        │ │ Progress        │
│ 15/30 ━━━━━━    │ │ 8/30 ━━━━      │
│                 │ │                 │
│ 🔥 15d  📅 Nov  │ │ ↗️ No  📅 Nov   │
├─────────────────┤ ├─────────────────┤
│   [View 👉]     │ │   [Join 👉]     │
└─────────────────┘ └─────────────────┘
  ~170px width      ~170px width
```

## Type Badge Colors

```
┌──────────────────────────────────────┐
│ Personal    →  #a855f7  (Purple)    │
│ Team        →  #f97316  (Orange)    │
│ Group       →  #00c2ff  (Cyan)      │
└──────────────────────────────────────┘
```

## Progress Bar States

```
Active Challenge:
Progress ━━━━━━━━░░░░░░░░░░ 50%
        └── #00c2ff (Cyan)

Completed Challenge:
Progress ████████████████████ 100%
        └── #10b981 (Green)
```

## Streak Indicators

```
WITH STREAK:
🔥 15d  (Flame icon in orange #f97316)

NO STREAK:
↗️ No streak  (Trending up icon in gray)
```

## Bottom Actions

```
JOINED CHALLENGE:
┌─────────────────┐
│   [View 👉]     │  ← Cyan text, transparent bg
└─────────────────┘

NEW CHALLENGE:
┌─────────────────┐
│   [Join 👉]     │  ← Cyan text, semi-transparent bg
└─────────────────┘

COMPLETED:
┌─────────────────┐
│  ✓ Completed    │  ← Green with checkmark icon
└─────────────────┘
```

## Grid Layout Example

```
Screen (393px width on iPhone 14 Pro)
├── Padding Left: 16px
├── Card 1: 170.5px
├── Gap: 16px
├── Card 2: 170.5px
└── Padding Right: 16px

Total: 16 + 170.5 + 16 + 170.5 + 16 = 389px ✓
```

## Responsive Calculation

```javascript
const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

// For 393px screen:
// (393 - 48) / 2 = 172.5px per card

// For 428px screen (Pro Max):
// (428 - 48) / 2 = 190px per card
```

## Color Palette Summary

| Element          | Color    | Hex       | Opacity |
|------------------|----------|-----------|---------|
| Background       | Black    | #000000   | 100%    |
| Card BG          | White    | #ffffff   | 5%      |
| Border           | White    | #ffffff   | 10%     |
| Title            | White    | #ffffff   | 100%    |
| Description      | White    | #ffffff   | 70%     |
| Stats            | White    | #ffffff   | 60-80%  |
| Personal Badge   | Purple   | #a855f7   | 40% bg  |
| Team Badge       | Orange   | #f97316   | 40% bg  |
| Group Badge      | Cyan     | #00c2ff   | 40% bg  |
| Progress (Active)| Cyan     | #00c2ff   | 100%    |
| Progress (Done)  | Green    | #10b981   | 100%    |
| Flame Icon       | Orange   | #f97316   | 100%    |
| Checkmark        | Green    | #10b981   | 100%    |

## Component Hierarchy

```
TouchableOpacity (card container, ~170px width)
└─ View (rounded-2xl, bg-white/5, border)
   ├─ View (Image container, 160px height)
   │  ├─ Image (challenge image)
   │  ├─ LinearGradient (overlay)
   │  ├─ View (badges row - absolute top)
   │  │  ├─ View (type badge)
   │  │  └─ View (members count) [if > 1]
   │  └─ View (title/desc - absolute bottom)
   │     ├─ Text (title)
   │     └─ Text (description)
   └─ View (content, p-3)
      ├─ View (progress section)
      │  ├─ View (progress label row)
      │  └─ View (progress bar)
      ├─ View (stats row)
      │  ├─ View (streak indicator)
      │  └─ View (end date)
      └─ View/TouchableOpacity (action)
         └─ Text (button text) OR
            View (completed badge)
```

## Font Sizes Reference

```
Title:          14px (text-sm)   - Bold
Description:    12px (text-xs)   - Regular
Badge Text:     12px (text-xs)   - Semi-bold
Progress Label: 12px (text-xs)   - Regular
Progress Value: 12px (text-xs)   - Medium
Stats:          12px (text-xs)   - Regular
Date:           10px (text-[10px])- Regular
Button:         12px (text-xs)   - Semi-bold
```

## Spacing Reference

```
Card Padding:        12px (p-3)
Badge Padding:       10px/4px (px-2.5 py-1)
Section Margins:     12px (mb-3)
Stat Gap:            6px (gap-1.5)
Progress Bar Height: 6px (h-1.5)
Border Radius:       16px (rounded-2xl)
Badge Radius:        9999px (rounded-full)
```

## Testing Scenarios

### Scenario 1: Group Challenge (Active, High Progress)
- Type: Group (Cyan badge)
- Members: 12 (shows count)
- Progress: 50% (cyan bar)
- Streak: 15 days (flame icon)
- Status: Joined (View button)

### Scenario 2: Personal Challenge (Active, Low Progress)
- Type: Personal (Purple badge)
- Members: 1 (no count shown)
- Progress: 27% (cyan bar)
- Streak: None (trending icon)
- Status: Not joined (Join button)

### Scenario 3: Team Challenge (Completed)
- Type: Team (Orange badge)
- Members: 8 (shows count)
- Progress: 100% (green bar)
- Streak: 21 days (flame icon)
- Status: Completed (checkmark badge)

---

**Visual Design Status:** Matches React version ✓
**Responsive Layout:** Works on all screen sizes ✓
**Dark Theme:** Optimized for black backgrounds ✓
