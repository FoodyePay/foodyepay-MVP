-- Add structured address parts to restaurants
-- Safe & idempotent

BEGIN;

ALTER TABLE IF EXISTS public.restaurants
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS country text;

-- Optional helpful indexes
CREATE INDEX IF NOT EXISTS idx_restaurants_postal_code ON public.restaurants (postal_code);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON public.restaurants (city);

COMMIT;
