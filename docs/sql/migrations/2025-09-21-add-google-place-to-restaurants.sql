-- Safe migration to add Google Maps fields to restaurants (if missing)
DO $$ BEGIN
  -- google_place_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'restaurants' AND column_name = 'google_place_id'
  ) THEN
    ALTER TABLE public.restaurants ADD COLUMN google_place_id TEXT;
  END IF;

  -- address
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'restaurants' AND column_name = 'address'
  ) THEN
    ALTER TABLE public.restaurants ADD COLUMN address TEXT;
  END IF;

  -- rating
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'restaurants' AND column_name = 'rating'
  ) THEN
    ALTER TABLE public.restaurants ADD COLUMN rating DECIMAL(2,1) DEFAULT 0;
  END IF;

  -- user_ratings_total
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'restaurants' AND column_name = 'user_ratings_total'
  ) THEN
    ALTER TABLE public.restaurants ADD COLUMN user_ratings_total INTEGER DEFAULT 0;
  END IF;

  -- business_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'restaurants' AND column_name = 'business_status'
  ) THEN
    ALTER TABLE public.restaurants ADD COLUMN business_status TEXT;
  END IF;

  -- price_level
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'restaurants' AND column_name = 'price_level'
  ) THEN
    ALTER TABLE public.restaurants ADD COLUMN price_level INTEGER;
  END IF;

  -- unique index for google_place_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'restaurants' AND indexname = 'restaurants_google_place_id_key'
  ) THEN
    -- Use a unique constraint name if not exists
    BEGIN
      ALTER TABLE public.restaurants ADD CONSTRAINT restaurants_google_place_id_key UNIQUE (google_place_id);
    EXCEPTION WHEN duplicate_table THEN
      -- ignore
    END;
  END IF;
END $$;

COMMENT ON COLUMN public.restaurants.google_place_id IS 'Unique Google Places ID to prevent duplicate registrations';