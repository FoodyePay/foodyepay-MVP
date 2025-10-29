# FoodyePay Connect Runbook (MVP)

Purpose: One-page hub for our Stripe Connect Express integration. Use this to onboard merchants, handle relinks, and resolve common issues quickly.

## Quick links
- Overview: ./onboarding.md
- Relink flow: ./relink.md
- Return page: ./return.md
- Refresh page: ./refresh.md
- Common failures & fixes: ./common-failures.md
 - Webhooks handling: ./webhooks.md
 - Express Dashboard: ./express-dashboard.md
- API reference (internal): ./api.md

## App touchpoints
- API routes
  - POST `/api/connect/start` – Create/connect account and return hosted onboarding link
  - GET `/api/connect/status` – Poll account requirements/capabilities (server-side)
  - POST `/api/connect/relink` – Generate a new onboarding link when the prior one expired or needs more info
  - GET `/api/connect/express-login` – Create Express Dashboard login link (for merchants to manage payouts/settings)
  - POST `/api/connect/webhook` – Connect webhook endpoint (account.updated, requirements changes)
- Pages
  - `/register` – Starts onboarding
  - `/register/connect/return` – Return URL after Stripe-hosted onboarding; finalizes and writes to DB
  - `/register/connect/refresh` – Refresh URL if user cancels/needs to resume; issues a fresh link
  - `/dashboard-restaurant` – Shows “Manage payouts and settings” (Express Dashboard login)

Note: The return/refresh bridge pages are dynamic and may be wrapped in Suspense to avoid static rendering warnings.

## Official Stripe docs (curated)
- Platforms & Marketplaces with Connect (overview)
  https://docs.stripe.com/connect
- Connect Integration Guide (design patterns)
  https://docs.stripe.com/connect/design-an-integration
- Connected Accounts API Reference
  https://docs.stripe.com/api/connected-accounts
- Connect Onboarding (choose hosted vs embedded vs API)
  https://docs.stripe.com/connect/onboarding
- Stripe-hosted Onboarding
  https://docs.stripe.com/connect/hosted-onboarding
- Embedded Onboarding
  https://docs.stripe.com/connect/embedded-onboarding
- API Onboarding
  https://docs.stripe.com/connect/api-onboarding
- Custom Connected Accounts
  https://docs.stripe.com/connect/custom-accounts
- Connect Webhooks
  https://docs.stripe.com/connect/webhooks
- Required Verification Information
  https://docs.stripe.com/connect/required-verification-information
- Manage Connected Accounts via Dashboard
  https://docs.stripe.com/connect/dashboard
- Cross-border Payouts
  https://docs.stripe.com/connect/cross-border-payouts
- Add Funds & Payouts / Transfers Guide
  https://docs.stripe.com/connect/add-and-pay-out-guide
- Top-ups to your Platform Balance
  https://docs.stripe.com/connect/top-ups
- Instant Payouts for Connect Users
  https://docs.stripe.com/payouts/instant-payouts

## Notes
- Keep secrets in environment; never commit keys. Ensure runtime='nodejs' for server routes.
- Prefer Stripe-hosted onboarding (Express) for MVP to minimize compliance surface.
