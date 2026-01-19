# ✅ FIXED: Tenant ID Now Uses User's Tenant

## Change Implemented
I have upgraded the security of the Vendor GST Details API to enforce authentication. This ensures that the system correctly identifies the logged-in user and uses their actual `tenant_id` instead of a default value.

### Breakdown:

1.  **Enforced `IsAuthenticated` Permission:** 
    - Changed `permission_classes` from `[AllowAny]` to `[IsAuthenticated]` in `vendorgstdetails_api.py`.
    - This forces the API to validate the auth token sent by the frontend.

2.  **Updated Tenant Extraction Logic:**
    - The `get_tenant_id` method now reliably captures the `tenant_id` from the authenticated user object.

### Result:
When you click "Save & Continue" now:
1.  The frontend sends your Auth Token.
2.  The backend verifies who you are.
3.  The backend extracts YOUR specific `tenant_id`.
4.  The data is saved with YOUR `tenant_id` (e.g., `tenant_ABC123`), not `default_tenant`.

## Verification
I have updated the test script to simulate a real authenticated user with a custom tenant ID (`test_tenant_999`), and the API correctly saved the data under that tenant ID.

## Instructions
1.  Make sure you are logged in to the application.
2.  Try saving the GST Details again.
3.  Check the logs/response; it should now show your correct `tenant_id`.
