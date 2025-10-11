-- Minimal Supabase migration: add Connect/Places fields to restaurants
-- Safe to run multiple times; uses IF NOT EXISTS and guard patterns.
--
-- What it does
-- 1) Adds columns: stripe_account_id, stripe_status, google_place_id, address,
--    rating, user_ratings_total, created_at, updated_at
-- 2) Adds indexes on stripe_account_id and google_place_id
-- 3) Adds an updated_at trigger to auto-refresh on row updates

BEGIN;

-- 1) Columns
ALTER TABLE IF EXISTS public.restaurants
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_status text,
  ADD COLUMN IF NOT EXISTS google_place_id text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS rating numeric(3,2),
  ADD COLUMN IF NOT EXISTS user_ratings_total integer,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- 2) Indexes (only on new columns to avoid schema drift)
CREATE INDEX IF NOT EXISTS idx_restaurants_stripe_account_id
  ON public.restaurants (stripe_account_id);

CREATE INDEX IF NOT EXISTS idx_restaurants_google_place_id
  ON public.restaurants (google_place_id);

-- 3) updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Re-create trigger idempotently
DROP TRIGGER IF EXISTS restaurants_set_updated_at ON public.restaurants;
CREATE TRIGGER restaurants_set_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMIT;
