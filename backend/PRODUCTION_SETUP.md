# ============================================================================
# QUICK START: Update Your .env File for Production
# ============================================================================

## Step 1: Generate New Secrets

You've already generated a secret! Use these commands to generate more:

```powershell
# Django Secret Key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# JWT Secret (64 characters)
python -c "import secrets; print(secrets.token_hex(32))"

# Or use the one you just generated:
# EKfkyowEAmKkRFAP7IhUsfOleRHts7WFkMkrzOu4BzOdwuzON-STYOnjOtiJD1V6HLJ46idLb9FBW-zvk_eeE_A
```

## Step 2: Update Your .env File

Open `backend/.env` and update these values:

```bash
# ============================================================================
# PRODUCTION CONFIGURATION FOR FINPIXE.COM
# ============================================================================

# CRITICAL: Set to False in production
DJANGO_DEBUG=False

# Django Secret Key (use the one you generated)
DJANGO_SECRET=<paste-your-generated-secret-here>

# Production domains
ALLOWED_HOSTS=finpixe.com,www.finpixe.com,api.finpixe.com

# ============================================================================
# DATABASE - Current Single Instance Setup
# ============================================================================

DB_HOST=localhost
DB_PORT=3306
DB_NAME=ai_accounting
DB_USER=root
DB_PASSWORD=Ulaganathan123
DB_CONN_MAX_AGE=600

# ============================================================================
# DATABASE - For 500K Users (After ProxySQL Deployment)
# ============================================================================
# Uncomment these when you deploy ProxySQL:
# DB_HOST=proxysql.finpixe.internal
# DB_PORT=6033
# DB_CONN_MAX_AGE=600

# ============================================================================
# JWT AUTHENTICATION
# ============================================================================

# JWT Secret (use a new one, not the exposed one)
JWT_SECRET=<paste-your-jwt-secret-here>

# ============================================================================
# REDIS
# ============================================================================

REDIS_URL=redis://127.0.0.1:6379/0

# ============================================================================
# EXTERNAL API KEYS (ROTATE THESE - They were exposed!)
# ============================================================================

# NEW Gemini API Key (rotate the old one)
GEMINI_API_KEY=<get-new-key-from-google-ai-studio>

# NEW Twilio Credentials (rotate the old ones)
TWILIO_ACCOUNT_SID=<your-twilio-sid>
TWILIO_AUTH_TOKEN=<get-new-token-from-twilio>
TWILIO_PHONE_NUMBER=<your-twilio-number>
```

## Step 3: Rotate Exposed API Keys

### Gemini API Key
1. Go to: https://makersuite.google.com/app/apikey
2. **Delete** old key: `AIzaSyCwwv2KU_QaH02fn0ofxhkGk5DQgXbGmo4`
3. Create new API key
4. Update `.env` with new key

### Twilio Auth Token
1. Go to: https://console.twilio.com/
2. Reset your Auth Token
3. Update `.env` with new token

## Step 4: Remove .env from Git (If Committed)

```powershell
# Navigate to backend directory
cd "c:\108\django v3\backend"

# Remove from Git tracking
git rm --cached .env

# Commit the removal
git commit -m "Remove .env from version control"

# Push changes
git push
```

## Step 5: Verify Configuration

```powershell
# Test Django settings
cd "c:\108\django v3\backend"
python manage.py check --deploy

# This should show warnings about security settings
# Make sure DEBUG=False is confirmed
```

## Step 6: Current vs. Future Setup

### Current (Single EC2 Instance):
```
DB_HOST=localhost
DB_PORT=3306
```
**Capacity**: ~500-2,000 concurrent users

### Future (500K Users with ProxySQL):
```
DB_HOST=proxysql.finpixe.internal
DB_PORT=6033
```
**Capacity**: 500,000+ concurrent users

## Quick Checklist

- [ ] Generate new Django secret key
- [ ] Generate new JWT secret
- [ ] Update `.env` with new secrets
- [ ] Set `DJANGO_DEBUG=False`
- [ ] Rotate Gemini API key
- [ ] Rotate Twilio auth token
- [ ] Remove `.env` from Git (if committed)
- [ ] Run `python manage.py check --deploy`
- [ ] Test application locally
- [ ] Deploy to production

## What's Already Configured

✅ Django settings updated for finpixe.com
✅ CORS configured for production domain
✅ Secure cookies enabled (HTTPS-only in production)
✅ Security headers configured (HSTS, CSP, etc.)
✅ Connection pooling enabled (600s)
✅ ProxySQL configuration ready for 500K users
✅ MySQL optimization config created

## Next: Deploy to Production

Follow the deployment guide:
- `production_deployment_guide.md` - For single EC2 instance
- `mysql_500k_scaling_guide.md` - For scaling to 500K users

---

**Need Help?**
- Single instance setup: See `production_deployment_guide.md`
- Scaling to 500K: See `mysql_500k_scaling_guide.md`
- Security assessment: See `implementation_plan.md`
