-- Relax NOT NULL constraints for restaurants email/phone to support Stripe-first onboarding
-- Safe to run multiple times; checks column existence before altering.

BEGIN;

-- Drop NOT NULL for email if the column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'restaurants' AND column_name = 'email'
  ) THEN
    EXECUTE 'ALTER TABLE public.restaurants ALTER COLUMN email DROP NOT NULL';
  END IF;
END$$;

-- Drop NOT NULL for phone if the column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'restaurants' AND column_name = 'phone'
  ) THEN
    EXECUTE 'ALTER TABLE public.restaurants ALTER COLUMN phone DROP NOT NULL';
  END IF;
END$$;

COMMIT;
