# Return URL Bridge

`/register/connect/return` is the landing page after Stripe-hosted onboarding completes or advances.

## Responsibilities
- Read context (session/merchant).
- Confirm or create merchant DB record; set `stripe_account_id`.
- Optionally fetch account status server-side and surface next steps.
- Redirect to dashboard or show a confirmation.

## Edge cases
- Return called but onboarding incomplete → show guidance and a button to resume (relink).
- The same return visited multiple times → idempotent; no duplicate inserts.

## Notes
- Marked as dynamic; safe to access request URL/headers.
- Keep UI minimal; avoid client-side styled-jsx in server component.
