# Superwall Implementation - Test Checklist

## ✅ Setup Complete

- ✅ Database migration run (new columns added)
- ✅ Subscription context implemented
- ✅ Superwall API fixed (`Superwall.shared.identify()` and `Superwall.shared.register()`)
- ✅ Profile screen updated to use subscription context
- ✅ Settings screen updated to use subscription context

---

## 📱 Manual Testing Steps

### 1. App Startup
**What to test:**
- [ ] App loads without crashes
- [ ] No Superwall API errors in console
- [ ] Check console for: `"Superwall subscription status: ..."`

**Expected behavior:**
- App loads normally
- Console shows subscription check happening
- Default plan is 'free' for new/existing users

---

### 2. Profile Screen - Create Group Button

**Location:** Profile tab → "Create New Group" button

**Test as FREE user:**
- [ ] Navigate to Profile tab
- [ ] Tap "Create New Group" button
- [ ] Should see Superwall paywall with "goalgetter" placement
- [ ] Paywall UI appears correctly
- [ ] Can dismiss paywall

**Expected behavior:**
- Paywall appears immediately
- Shows your configured products
- Can be dismissed
- Does NOT open create group modal

---

### 3. Settings - Test Paywall Button

**Location:** Profile tab → Settings icon → "Test Paywall"

**Test:**
- [ ] Navigate to Settings
- [ ] Tap "Test Paywall" button
- [ ] Should see Superwall paywall
- [ ] Can dismiss

**If already paid:**
- [ ] Should see alert: "Premium active - You already have premium access."

---

### 4. Subscription Status Check

**What to check in console:**
```
Superwall subscription status: <status>
```

Possible statuses:
- `active` - User has active subscription
- `inactive` - User is free
- `trial` - User is on trial
- `unknown` - Unable to determine

---

### 5. Database Verification

**Check in Supabase dashboard:**

**SQL Query:**
```sql
SELECT 
  id, 
  display_name,
  plan,
  superwall_user_id,
  current_product_id,
  subscription_expires_at
FROM profiles
WHERE id = 'YOUR_USER_ID';
```

**Expected:**
- [ ] `plan` column exists and shows 'free' (or 'pro'/'lifetime' if subscribed)
- [ ] Other subscription columns exist (can be null)
- [ ] `is_premium` column is gone

---

## 🧪 Testing Purchase Flow (Optional)

**To test actual purchases:**

1. **Sandbox Account Required**
   - iOS: Create sandbox tester in App Store Connect
   - Android: Add test account in Google Play Console

2. **Test Purchase:**
   - [ ] Tap create group button
   - [ ] Select a product in paywall
   - [ ] Complete sandbox purchase
   - [ ] Paywall dismisses
   - [ ] Try create group again
   - [ ] Should now open modal (not paywall)

3. **Verify Database Updated:**
   - [ ] Check `plan` changed to 'pro'
   - [ ] Check `current_product_id` is set
   - [ ] Check `subscription_expires_at` is set (if applicable)

---

## 🐛 Common Issues & Fixes

### Issue: "TypeError: Superwall.shared.identify is not a function"
**Fix:** ✅ Already fixed - using correct API

### Issue: "Column 'plan' does not exist"
**Fix:** ✅ Already fixed - migration run

### Issue: Paywall doesn't show
**Possible causes:**
- Not running on device/dev build (Expo Go not supported)
- Superwall campaign not configured
- Placement name mismatch

**Check:**
- Verify placement is "goalgetter" in Superwall dashboard
- Verify API keys are correct in `Settings.ts`
- Check console for Superwall errors

### Issue: Database not updating after purchase
**Possible cause:** Webhook not set up yet

**Current behavior:**
- Client-side sync works on app restart
- Webhook sync is optional for now (but recommended)

**To add webhook:**
- See `SUPERWALL_IMPLEMENTATION_GUIDE.md` Section 2
- Deploy Supabase Edge Function
- Configure webhook in Superwall dashboard

---

## 📊 Console Logs to Monitor

You should see these logs:

```
✅ Superwall subscription status: inactive
✅ (or) Superwall subscription status: active
✅ (or) Superwall subscription status: trial
```

After identifying user:
```
✅ User identified in Superwall
```

When showing paywall:
```
✅ Paywall shown for placement: goalgetter
```

If errors:
```
❌ Error refreshing subscription: [error details]
❌ Error identifying user in Superwall: [error details]
❌ Error showing paywall: [error details]
```

---

## ✅ Success Criteria

Your implementation is working correctly if:

1. ✅ App loads without errors
2. ✅ Free users see paywall when tapping "Create Group"
3. ✅ Subscription status logs appear in console
4. ✅ Database has new subscription columns
5. ✅ Test paywall button works in Settings

---

## 🚀 Next Steps (Optional Enhancements)

Once basic flow is working:

1. **Add Webhook Handler** (for automatic DB sync)
   - See `SUPERWALL_IMPLEMENTATION_GUIDE.md` Section 2
   - Deploy Supabase Edge Function
   - Configure in Superwall dashboard

2. **Add More Paywalled Features**
   - Use same pattern: check `isPaid`, show paywall if false
   - Examples: premium themes, analytics, etc.

3. **Add Visual Indicators**
   - Show "PRO" badge on locked features
   - Add subscription status to profile
   - Show plan in settings

4. **Analytics & Monitoring**
   - Track paywall conversion in Superwall dashboard
   - Monitor subscription changes
   - A/B test different paywalls

---

**Current Status:** Implementation complete, ready for testing! 🎉
