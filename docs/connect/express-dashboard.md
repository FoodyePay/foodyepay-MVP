# Express Dashboard (Merchant Self-Serve)

Merchants manage payouts, bank accounts, and settings via Stripe's Express Dashboard.

## Endpoint
- GET `/api/connect/express-login`
  - Creates a one-time login link for the connected account.

## UX entry points
- `/dashboard-restaurant` → “Manage payouts and settings” button links to the generated URL.
- Support can issue a one-off link to help a merchant update bank details or view payouts.

## When to prefer Express Dashboard
- To review and update payout schedule, external accounts, and business information.
- When Stripe requires additional verification—send merchant to Express Dashboard or use a relink.

## Notes
- Links expire quickly; always fetch fresh on click.
- Do not proxy or frame the dashboard.

## References
- Manage Connected Accounts via Dashboard: https://docs.stripe.com/connect/dashboard
