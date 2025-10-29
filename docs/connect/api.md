# Internal API Reference (Connect)

Stable contract for our app's Connect-related routes.

## POST /api/connect/start
- Purpose: Create or find connected account; issue hosted onboarding Account Link.
- Request: `{ merchantId?: string }` (optional; infer from session if absent)
- Response: `{ url: string, expires_at: number, stripe_account_id: string }`

## GET /api/connect/status
- Purpose: Fetch latest account status server-side.
- Query: `merchantId` or inferred from session.
- Response (example):
```json
{
  "stripe_account_id": "acct_...",
  "payouts_enabled": false,
  "charges_enabled": true,
  "requirements": {
    "currently_due": ["individual.verification_document"],
    "past_due": [],
    "eventually_due": ["individual.address", "business_profile.url"]
  }
}
```

## POST /api/connect/relink
- Purpose: Generate a fresh onboarding link for an existing connected account.
- Request: `{ merchantId?: string }`
- Response: `{ url: string, expires_at: number }`

## GET /api/connect/express-login
- Purpose: Create a login link to the Express Dashboard for the connected account.
- Response: `{ url: string }`

## POST /api/connect/webhook
- Purpose: Handle Connect events (see `webhooks.md`).
- Behavior: Verify signature, process idempotently, return 200.
