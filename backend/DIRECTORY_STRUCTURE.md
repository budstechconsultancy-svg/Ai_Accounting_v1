# Backend Directory Structure - README

## 📁 Organized Directory Structure

```
backend/
├── manage.py                      # Django management script
├── requirements.txt               # Python dependencies
├── gunicorn_config.py            # Gunicorn production config
├── manage_workers.py             # RQ worker management
├── pyproject.toml                # Python project config
├── pyrightconfig.json            # Type checking config
│
├── .env                          # Environment variables (DO NOT COMMIT)
├── .env.development.template     # Development env template
├── .env.production.template      # Production env template
├── .gitignore                    # Git ignore rules
│
├── Dockerfile                    # Docker config for app
├── Dockerfile.worker             # Docker config for workers
│
├── CONFIGURATION_SUMMARY.md      # Current setup summary
├── PRODUCTION_SETUP.md           # Production deployment guide
│
├── backend/                      # Django project settings
│   ├── __init__.py
│   ├── settings.py              # Main settings (PRODUCTION READY)
│   ├── urls.py                  # URL routing
│   ├── wsgi.py                  # WSGI config
│   └── asgi.py                  # ASGI config
│
├── core/                         # Core application
│   ├── models.py                # User, Tenant, etc.
│   ├── views.py                 # API views
│   ├── serializers.py           # DRF serializers
│   ├── authentication.py        # JWT auth
│   ├── middleware.py            # Custom middleware
│   └── ...
│
├── accounting/                   # Accounting module
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── ...
│
├── inventory/                    # Inventory module
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── ...
│
├── otp/                         # OTP/SMS module
│   ├── models.py
│   ├── views.py
│   ├── services.py
│   └── ...
│
├── scripts/                     # Utility & test scripts (MOVED HERE)
│   ├── test_*.py               # All test scripts
│   ├── debug_*.py              # Debug utilities
│   ├── verify_*.py             # Verification scripts
│   ├── *.sql                   # SQL scripts
│   └── ...
│
└── venv/                        # Virtual environment (DO NOT COMMIT)
```

## 🗑️ Files Removed

The following temporary/test files were deleted:
- `owner_test_output.txt` - Test output
- `owner_token_output.log` - Test logs
- `test_daybook.xlsx` - Test Excel file
- `.env.example` - Replaced by better templates

## 📦 Files Moved to `scripts/`

All test, debug, and utility scripts have been moved to `scripts/` directory:

### Test Scripts (19 files)
- `test_*.py` - All test files

### Debug Scripts (3 files)
- `debug_*.py` - Debug utilities
- `simple_owner_test.py`

### Database Utilities (23 files)
- `apply_schema.py`, `check_*.py`, `create_*.py`, etc.
- `verify_*.py` - Verification scripts
- `*.sql` - SQL scripts

## ✅ Production-Ready Structure

The root `backend/` directory now contains only:
- **Core files**: `manage.py`, `requirements.txt`, configs
- **Environment templates**: `.env.*.template`
- **Documentation**: `*.md` files
- **Django apps**: `core/`, `accounting/`, `inventory/`, `otp/`
- **Utilities**: `scripts/` (organized separately)

## 🚀 Usage

### Running Tests
```bash
# Tests are now in scripts/
python scripts/test_login.py
python scripts/test_otp_system.py
```

### Running Utilities
```bash
# Database utilities
python scripts/seed_rbac.py
python scripts/clear_database.py
```

### Production Deployment
```bash
# Only production files in root
python manage.py migrate
python manage.py collectstatic
gunicorn -c gunicorn_config.py backend.wsgi:application
```

## 📝 Notes

- **`.env` file**: Protected by `.gitignore`, never commit this
- **`venv/` directory**: Virtual environment, excluded from Git
- **`scripts/` directory**: Development utilities, not deployed to production
- **Production files**: Clean, organized, ready for deployment

---

**Last Updated**: 2025-12-16  
**Status**: ✅ Production Ready
