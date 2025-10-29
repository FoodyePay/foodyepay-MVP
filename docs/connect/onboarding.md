# Onboarding (Hosted by Stripe – Express)

This document describes FoodyePay's merchant onboarding using Stripe Connect Express with Stripe-hosted onboarding links.

## Flow
1) Platform initiates onboarding via POST `/api/connect/start`.
   - Creates a connected account (or reuses existing), generates an Account Link with `type=account_onboarding` and `return_url`/`refresh_url`.
   - Response contains `url` for redirect.
2) User completes steps on Stripe.
3) Stripe redirects to our `return_url` or `refresh_url`.
4) Our bridge page (`/register/connect/return` or `/register/connect/refresh`) finalizes/continues the flow and updates DB.
5) We poll `/api/connect/status` or rely on webhooks to reflect requirements in UI.

## UX anchors
- Start: `/register`
- Bridge pages: `/register/connect/return`, `/register/connect/refresh`
- Manage payouts: `/dashboard-restaurant` → “Manage payouts and settings” (Express Dashboard login)

## Data model (MVP)
- Merchant record includes Stripe fields, e.g. `stripe_account_id` and a compact status JSON (e.g. `stripe_requirements_summary`).
- Keep timestamps (`created_at`, `updated_at`) via DB triggers.

## Environment
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET (for Connect events)
- NEXT_PUBLIC_APP_BASE_URL (to build return/refresh URLs)

## Acceptance checks
- First-time merchant gets redirected to Stripe link; on return, merchant record has `stripe_account_id` populated.
- If Stripe shows “more information needed”, our UI surfaces a CTA to “Return to Stripe” (or shows Express Dashboard link).
- Expired link on refresh generates a new link via `/api/connect/relink`.

## References
- Hosted onboarding: https://docs.stripe.com/connect/hosted-onboarding
- Integration design: https://docs.stripe.com/connect/design-an-integration
- Required info: https://docs.stripe.com/connect/required-verification-information
