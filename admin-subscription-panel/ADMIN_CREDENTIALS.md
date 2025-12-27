# 🔐 Admin Panel Hardcoded Credentials

## Credentials

**Username**: `budstech`  
**Password**: `123`

---

## How It Works

The admin panel login has **hardcoded credentials** that bypass the database authentication.

### Login Flow:

1. **User enters credentials**
2. **First check**: Compare against hardcoded credentials
   - Username: `budstech`
   - Password: `123`
3. **If match**: Login immediately (no API call, no database check)
4. **If no match**: Try API authentication with database

---

## Code Location

**File**: `admin-subscription-panel/components/LoginPage.tsx`

**Lines**: 22-36

```typescript
// HARDCODED ADMIN CREDENTIALS - Check first before API call
const ADMIN_USERNAME = 'budstech';
const ADMIN_PASSWORD = '123';

if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
  // Hardcoded admin login - no database check
  setLoading(false);
  localStorage.setItem('token', 'admin-hardcoded-token');
  localStorage.setItem('isHardcodedAdmin', 'true');
  onLogin();
  return;
}
```

---

## Security Notes

### ⚠️ Important:

1. **Not stored in database** - Credentials are in code only
2. **No encryption** - Password is plain text in source code
3. **Production Risk** - Anyone with code access can see credentials
4. **No password change** - Must edit code to change password

### 🔒 Recommendations:

For production, consider:
- Using environment variables for credentials
- Implementing proper authentication
- Adding rate limiting
- Using strong passwords
- Enabling 2FA

---

## Local Storage

When logged in with hardcoded credentials:
- `token`: `"admin-hardcoded-token"`
- `isHardcodedAdmin`: `"true"`

When logged in via API:
- `token`: JWT token from backend
- `isHardcodedAdmin`: `"false"`

---

## Testing

1. Go to `http://localhost:3000/admin`
2. Enter:
   - Username: `budstech`
   - Password: `123`
3. Click "Sign In"
4. Should login immediately without API call

---

## Changing Credentials

To change the hardcoded credentials:

1. Open `admin-subscription-panel/components/LoginPage.tsx`
2. Find lines 25-26:
   ```typescript
   const ADMIN_USERNAME = 'budstech';
   const ADMIN_PASSWORD = '123';
   ```
3. Change values
4. Save file
5. Vite will auto-reload

---

## Production Deployment

### Option 1: Keep Hardcoded (Simple)
- Deploy as-is
- Credentials remain `budstech` / `123`
- Easy but less secure

### Option 2: Environment Variables (Better)
```typescript
const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || 'budstech';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '123';
```

Then in `.env`:
```
VITE_ADMIN_USERNAME=your_username
VITE_ADMIN_PASSWORD=your_password
```

### Option 3: Remove Hardcoded (Most Secure)
- Remove hardcoded check
- Use only API authentication
- Store admin in database

---

## Current Status

✅ **Hardcoded credentials active**  
✅ **Username**: `budstech`  
✅ **Password**: `123`  
✅ **No database required**  
✅ **Instant login**

---

**Last Updated**: 2025-12-16  
**File**: `admin-subscription-panel/components/LoginPage.tsx`
