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
