-- Safe migration: allow NULL in restaurants.ein (for Google Maps + Twilio MVP flow)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'restaurants'
      AND column_name  = 'ein'
      AND is_nullable  = 'NO'
  ) THEN
    ALTER TABLE public.restaurants ALTER COLUMN ein DROP NOT NULL;
  END IF;
END $$;

-- Note: keeping any existing UNIQUE constraint on ein is fine; PostgreSQL allows multiple NULLs under UNIQUE.