# Webhooks (Connect)

We listen to events that update account verification requirements and payout status.

## Endpoint
- POST `/api/connect/webhook`
  - Verify with STRIPE_WEBHOOK_SECRET.
  - Handle events: `account.updated`, `account.external_account.created/updated` (optional), `capability.updated` (optional).

## Minimal handler logic
- On `account.updated`:
  - Extract: `id` (acct_), `requirements.currently_due`, `requirements.past_due`, `future_requirements.currently_due`, `payouts_enabled`, `charges_enabled`.
  - Upsert into merchant record (e.g., `stripe_requirements_summary`).
  - If everything satisfied and payouts enabled, mark merchant as payout-ready.

## Reliability
- Log all deliveries with event id and account id.
- Make handler idempotent (check event.id previously processed).

## References
- Connect webhooks: https://docs.stripe.com/connect/webhooks
- Accounts API: https://docs.stripe.com/api/connected-accounts
