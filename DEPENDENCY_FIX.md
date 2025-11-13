# Dependency Fix - expo-image-picker

## Issue
```
Unable to resolve "expo-image-picker" from "components/challenge-tabs/TaskTrackerTab.tsx"
```

## Solution
Installed the missing package:
```bash
npm install expo-image-picker
```

## Verification
All required dependencies are now installed:

✅ `expo-image@2.3.2` - For optimized image display  
✅ `expo-linear-gradient@14.1.5` - For gradient overlays  
✅ `expo-image-picker@17.0.8` - For photo upload in TaskTrackerTab  
✅ `@expo/vector-icons@14.1.0` - For Ionicons  

## Where Used

### expo-image-picker
**File:** `components/challenge-tabs/TaskTrackerTab.tsx`  
**Purpose:** Allows users to upload photo evidence for completed tasks  
**Features:**
- Request camera roll permissions
- Launch image picker
- Select and preview images
- Image editing (crop, aspect ratio)

## Configuration Required

The app needs camera roll permissions. Make sure these are in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "The app needs access to your photos to upload progress images."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "We need access to your photo library to upload progress images.",
        "NSCameraUsageDescription": "We need access to your camera to take progress photos."
      }
    },
    "android": {
      "permissions": [
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "CAMERA"
      ]
    }
  }
}
```

## Testing

To test the photo upload feature:

1. Navigate to Challenge Details screen
2. Switch to "Tasks" tab
3. Tap "Upload a photo" in Photo Evidence section
4. Grant permissions when prompted
5. Select an image from camera roll
6. Image should display in preview
7. Tap X button to remove image

## Next Steps

If permissions are not configured, users will see:
- iOS: "Permission Required" alert
- Android: Permission denied error

Add permission checks in production:

```tsx
const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
if (status !== 'granted') {
  Alert.alert(
    'Permission Required',
    'Please grant photo library access in Settings to upload images.'
  );
  return;
}
```

## Status: ✅ RESOLVED

The error is now fixed! Here's what was done:

### 1. Package Installed ✅
```bash
npm install expo-image-picker
```
Installed version: `expo-image-picker@17.0.8`

### 2. Permissions Configured ✅
Updated `app.json` with:

**iOS:**
- `NSPhotoLibraryUsageDescription` - Photo library access
- `NSCameraUsageDescription` - Camera access

**Android:**
- `READ_EXTERNAL_STORAGE` - Read images
- `WRITE_EXTERNAL_STORAGE` - Write images
- `CAMERA` - Camera access
- `READ_MEDIA_IMAGES` - Android 13+ media access

### 3. Plugin Added ✅
Added `expo-image-picker` plugin to the plugins array in `app.json`.

## ⚠️ Important: Rebuild Required

Since we modified native permissions in `app.json`, you need to rebuild the app:

### Development Build
```bash
# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

### Or Create New Build
```bash
# For iOS
eas build --profile development --platform ios

# For Android
eas build --profile development --platform android
```

### Expo Go (Limited Support)
⚠️ Note: Image picker works in Expo Go but with limited features. For full functionality, use a development build.

## Testing

After rebuilding, test the photo upload:

1. Open Challenge Details screen
2. Navigate to Tasks tab
3. Scroll to "Add Photo Evidence" section
4. Tap "Upload a photo"
5. Grant permission when prompted (first time only)
6. Select an image from library
7. Verify image displays correctly
8. Tap X to remove and test again

## TaskTrackerTab Component Ready

The TaskTrackerTab component should now work correctly with full photo upload functionality!
