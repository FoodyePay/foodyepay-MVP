# Common Failures & Fixes

A quick triage for onboarding issues.

## 1) Link expired or already used
- Symptom: Visiting link returns an error.
- Fix: Call `/api/connect/relink` and redirect to the fresh link.

## 2) More information required
- Symptom: Payouts disabled; `requirements.currently_due` not empty.
- Fix: Surface CTA to return to Stripe (relink) or open Express Dashboard. Wait for webhook `account.updated` before unlocking payouts.

## 3) Country or business type mismatch
- Symptom: Verification fails due to jurisdiction.
- Fix: Confirm business country; ensure supported in target program.

## 4) Identity document problems
- Symptom: Rejections for low quality or mismatch.
- Fix: Ask user to re-upload via Stripe flow; do not collect documents directly in MVP.

## 5) Missing or wrong environment configuration
- Symptom: 500 errors from Connect API calls.
- Fix: Check STRIPE_SECRET_KEY, NEXT_PUBLIC_APP_BASE_URL, and webhook secret. Ensure routes set `export const runtime = 'nodejs'` if needed.

## 6) Webhook not firing
- Symptom: UI never updates from 'pending' to 'complete'.
- Fix: Verify endpoint URL and STRIPE_WEBHOOK_SECRET. Add logging and idempotent upserts on `account.updated`.

## References
- Webhooks: https://docs.stripe.com/connect/webhooks
- Required info: https://docs.stripe.com/connect/required-verification-information
