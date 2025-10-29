# Relink (Resume or Fix Onboarding)

Use when the previous onboarding link expired, was consumed, or Stripe requires more information.

## Endpoint
- POST `/api/connect/relink`
  - Input: merchant identifier (implicit from session or explicit payload)
  - Behavior: Creates a new Account Link with `type=account_onboarding` using the existing `stripe_account_id`.
  - Output: `{ url, expires_at }`

## When to trigger
- User revisits `/register` and we detect `requirements.currently_due`.
- Bridge page `/register/connect/refresh` after cancel.
- Support manually issues a relink from the admin.

## Gotchas
- Account Links are single-use and expire quickly; always fetch a fresh link.
- If the account is disabled for payouts, prompt merchant to complete requirements first.

## References
- Account Links & onboarding: https://docs.stripe.com/connect/hosted-onboarding
- Webhooks for requirements: https://docs.stripe.com/connect/webhooks
