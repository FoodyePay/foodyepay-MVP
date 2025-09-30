This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-onchain`]().


## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Next, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.


## Learn More

To learn more about OnchainKit, see our [documentation](https://onchainkit.xyz/getting-started).

To learn more about Next.js, see the [Next.js documentation](https://nextjs.org/docs).


## Database Upgrade Steps (Supabase)

If you encounter database errors such as missing columns (e.g., `google_place_id`) or NOT NULL violations on `ein`, run these safe migrations in Supabase SQL Editor. They are idempotent and align the schema with the current MVP flow.

1) Add Google Places fields to `restaurants`

- File: `docs/sql/migrations/2025-09-21-add-google-place-to-restaurants.sql`
- Adds: `google_place_id`, `address`, `rating`, `user_ratings_total`, `business_status`, `price_level` (if missing), plus a unique constraint on `google_place_id`.

Steps:
- Supabase Dashboard → SQL Editor → New query → Paste file contents → Run
- Expected: `Success. No rows returned`

Verify:
```sql
select column_name, data_type
from information_schema.columns
where table_schema='public'
  and table_name='restaurants'
  and column_name in ('google_place_id','address','rating','user_ratings_total','business_status','price_level');
```

2) Make `ein` nullable (recommended for MVP)

- File: `docs/sql/migrations/2025-09-21-make-ein-nullable.sql`
- Drops NOT NULL on `restaurants.ein` if present so registration doesn’t require EIN upfront.

Steps:
- Supabase Dashboard → SQL Editor → New query → Paste file contents → Run
- Expected: `Success. No rows returned`

Verify:
```sql
select column_name, is_nullable
from information_schema.columns
where table_schema='public' and table_name='restaurants' and column_name='ein';
```

Notes
- If the REST schema cache lags, wait ~30–60 seconds or refresh it from Project Settings → API.
- `google_place_id` unique constraint prevents duplicate restaurant claims by the same Google Place.
- Existing minimal records (inserted before migration) can be backfilled later with Google data.

## Legal & Compliance

Deployed app includes dedicated legal pages (bilingual EN/中文):

| Purpose | Route |
|---------|-------|
| Terms of Service | `/legal/terms` |
| Privacy Policy | `/legal/privacy` |
| Digital Asset Risk Disclaimer | `/legal/risk-disclaimer` |

These pages are rendered server-side and can be updated without changing client bundles.

App store readiness & compliance checklist: `docs/APP_STORE_CHECKLIST.md`.

### Updating Legal Text
Edit the corresponding file under `app/legal/*/page.tsx` and redeploy. Keep sensitive regulatory disclaimers accurate for your jurisdiction. If you add corporate domicile or supervisory authority info, update the Governing Law section in Terms.

### Data Collected (Summary)
- Wallet address (public)
- Restaurant metadata (Google Maps verified)
- Email (verification + notifications)
- Phone number (verification status only)
- Basic usage logs (performance & anti-fraud)

No payment card data or private keys are stored by FoodyePay; onramp is handled via Coinbase.

### Next Steps (Recommended)
- Rotate any secrets that were ever stored locally in `.env.local` and move them to deployment environment variables only.
- Add rate limiting & abuse monitoring for phone/email verification routes.
- Add `/legal/updates` changelog if frequent policy revisions occur.
 - Review Onramp security hardening: see `docs/ONRAMP_SECURITY.md` (CORS allowlist + clientIp forwarding).
