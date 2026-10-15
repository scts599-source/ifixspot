# Supabase CRM Setup

This app connects to Supabase only through Vercel serverless functions. The service-role key is never sent to browser code. Do not add real keys to git or use a `VITE_` prefix for secrets.

## 1. Apply the database migration

In the Supabase project SQL Editor, run `supabase/migrations/202610160001_leads.sql`. The migration creates or adds the columns and indexes expected by the CRM and enables row-level security. Browser roles receive no table permissions; the server-side service role is used by the API.

The migration is additive and does not delete existing lead rows. Review it against any custom production schema before applying it.

## 2. Configure Vercel environment variables

Set these for Production (and Preview if CRM preview testing is needed):

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: service-role key from Supabase project API settings; server-only
- `CRM_USERNAME`: CRM username
- `CRM_PASSWORD`: unique strong CRM password
- `CRM_SESSION_SECRET`: random secret at least 32 characters long

Generate a session secret with Node: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. Redeploy after adding or changing environment variables.

## 3. CRM routes and data flow

- `/api/auth`: validates CRM credentials and issues an 8-hour HttpOnly, Secure-in-production, SameSite=Strict session cookie.
- `/api/get-leads`: returns shared lead rows to an authenticated CRM session.
- `/api/track-lead`: accepts validated public booking inserts and authenticated CRM create/update/import operations.
- `/api/clear-leads`: deletes only the confirmed exported lead IDs for the selected team.
- Public booking submits to the CRM and Formspree. A submission ID prevents duplicate CRM rows if the browser retries.

The daily CSV confirmation deletes only the exact exported IDs and team after the user confirms the file was saved. Re-importing the same CSV is idempotent through the `import_key` unique index.

## 4. Verify before advertising the CRM as live

After deployment, test CRM login, create a test lead, refresh and verify it remains, update its status, export a team CSV, and confirm the exported rows clear. Also submit one website test lead and verify it appears in both the CRM and Formspree inbox. Remove the test lead after verifying.
