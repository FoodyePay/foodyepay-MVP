# Refresh URL Bridge

`/register/connect/refresh` is used when the user cancels or needs to restart onboarding from Stripe.

## Responsibilities
- Explain that the onboarding wasn't completed.
- Call `/api/connect/relink` to generate a fresh link.
- Redirect the user to the new link or provide a button.

## Edge cases
- Old link reused → Stripe error; always fetch a new link.
- No `stripe_account_id` yet → fall back to `/api/connect/start`.
