-- FoodyePay AVOS (AI Voice Ordering System) Schema Migration
-- Comprehensive database tables for voice call management, order processing, and AI configuration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLE: avos_calls
-- Purpose: Track all incoming voice calls to restaurant AVOS numbers
-- ============================================================================
CREATE TABLE IF NOT EXISTS avos_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL,
  caller_phone TEXT NOT NULL,
  restaurant_phone TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'zh', 'yue', 'es')),
  duration_seconds INT DEFAULT 0 CHECK (duration_seconds >= 0),
  call_status TEXT NOT NULL DEFAULT 'initiated'
    CHECK (call_status IN ('initiated', 'connected', 'in_progress', 'completed', 'failed', 'transferred')),
  call_recording_url TEXT,
  transcript JSONB DEFAULT '[]'::jsonb,
  ai_engine TEXT DEFAULT 'google_gemini_2'
    CHECK (ai_engine IN ('google_gemini_2', 'amazon_nova_sonic')),
  dialog_state TEXT,
  order_id UUID,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_restaurant_id FOREIGN KEY (restaurant_id)
    REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Indexes for optimal query performance
CREATE INDEX idx_avos_calls_restaurant_id ON avos_calls(restaurant_id);
CREATE INDEX idx_avos_calls_call_status ON avos_calls(call_status);
CREATE INDEX idx_avos_calls_started_at ON avos_calls(started_at DESC);
CREATE INDEX idx_avos_calls_order_id ON avos_calls(order_id);
CREATE INDEX idx_avos_calls_caller_phone ON avos_calls(caller_phone);

-- ============================================================================
-- TABLE: avos_orders
-- Purpose: Orders placed via voice calls with payment tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS avos_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL,
  restaurant_id UUID NOT NULL,
  customer_phone TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal_usd NUMERIC(10, 2) NOT NULL CHECK (subtotal_usd >= 0),
  tax_usd NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (tax_usd >= 0),
  total_usd NUMERIC(10, 2) NOT NULL CHECK (total_usd >= 0),
  foody_amount NUMERIC(20, 8) NOT NULL CHECK (foody_amount > 0),
  exchange_rate NUMERIC(20, 8) NOT NULL CHECK (exchange_rate > 0),
  payment_method TEXT DEFAULT 'sms_link'
    CHECK (payment_method IN ('foody_wallet', 'sms_link')),
  payment_link TEXT,
  payment_token TEXT UNIQUE,
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'sent', 'completed', 'expired', 'failed')),
  tx_hash TEXT,
  order_id UUID,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_call_id FOREIGN KEY (call_id)
    REFERENCES avos_calls(id) ON DELETE CASCADE,
  CONSTRAINT fk_restaurant_id FOREIGN KEY (restaurant_id)
    REFERENCES restaurants(id) ON DELETE CASCADE,
  CONSTRAINT payment_token_format CHECK (
    payment_token IS NULL OR length(payment_token) >= 32
  )
);

-- Indexes for optimal query performance
CREATE INDEX idx_avos_orders_call_id ON avos_orders(call_id);
CREATE INDEX idx_avos_orders_restaurant_id ON avos_orders(restaurant_id);
CREATE INDEX idx_avos_orders_payment_token ON avos_orders(payment_token);
CREATE INDEX idx_avos_orders_payment_status ON avos_orders(payment_status);
CREATE INDEX idx_avos_orders_customer_phone ON avos_orders(customer_phone);
CREATE INDEX idx_avos_orders_created_at ON avos_orders(created_at DESC);

-- ============================================================================
-- TABLE: avos_config
-- Purpose: Per-restaurant AVOS settings and configuration
-- ============================================================================
CREATE TABLE IF NOT EXISTS avos_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL UNIQUE,
  avos_enabled BOOLEAN DEFAULT false,
  phone_number TEXT,
  primary_language TEXT DEFAULT 'en' CHECK (primary_language IN ('en', 'zh', 'yue', 'es')),
  supported_languages TEXT[] DEFAULT ARRAY['en']::TEXT[],
  ai_engine TEXT DEFAULT 'google_gemini_2'
    CHECK (ai_engine IN ('google_gemini_2', 'amazon_nova_sonic')),
  greeting_message JSONB DEFAULT '{"en": "Hello, welcome to our restaurant. How can I help you?"}'::jsonb,
  max_call_duration_seconds INT DEFAULT 900 CHECK (max_call_duration_seconds > 0),
  enable_recording BOOLEAN DEFAULT true,
  enable_upselling BOOLEAN DEFAULT true,
  auto_payment_enabled BOOLEAN DEFAULT false,
  sms_payment_enabled BOOLEAN DEFAULT true,
  transfer_to_human_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_restaurant_id FOREIGN KEY (restaurant_id)
    REFERENCES restaurants(id) ON DELETE CASCADE,
  CONSTRAINT greeting_message_structure CHECK (
    greeting_message ? 'en' OR greeting_message ? 'zh' OR
    greeting_message ? 'yue' OR greeting_message ? 'es'
  ),
  CONSTRAINT supported_languages_valid CHECK (
    supported_languages <@ ARRAY['en', 'zh', 'yue', 'es']::TEXT[]
  ),
  CONSTRAINT phone_format CHECK (
    phone_number IS NULL OR phone_number ~ '^\+?[1-9]\d{1,14}$'
  )
);

-- Index on restaurant_id (already unique, but for consistency)
CREATE INDEX idx_avos_config_restaurant_id ON avos_config(restaurant_id);

-- Trigger for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_avos_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER avos_config_updated_at_trigger
BEFORE UPDATE ON avos_config
FOR EACH ROW
EXECUTE FUNCTION update_avos_config_updated_at();

-- ============================================================================
-- TABLE: avos_menu_index
-- Purpose: Fast menu lookup with multilingual support and fuzzy matching
-- ============================================================================
CREATE TABLE IF NOT EXISTS avos_menu_index (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL,
  menu_item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  item_name_zh TEXT,
  item_name_yue TEXT,
  item_name_es TEXT,
  aliases JSONB DEFAULT '[]'::jsonb,
  phonetic_en TEXT,
  phonetic_zh TEXT,
  phonetic_yue TEXT,
  category TEXT NOT NULL,
  price_usd NUMERIC(10, 2) NOT NULL CHECK (price_usd > 0),
  is_available BOOLEAN DEFAULT true,
  search_vector tsvector,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_restaurant_id FOREIGN KEY (restaurant_id)
    REFERENCES restaurants(id) ON DELETE CASCADE,
  CONSTRAINT fk_menu_item_id FOREIGN KEY (menu_item_id)
    REFERENCES menu_items(id) ON DELETE CASCADE,
  CONSTRAINT aliases_is_array CHECK (jsonb_typeof(aliases) = 'array'),
  CONSTRAINT unique_menu_item_per_restaurant UNIQUE (restaurant_id, menu_item_id)
);

-- Indexes for optimal query performance
CREATE INDEX idx_avos_menu_index_restaurant_id ON avos_menu_index(restaurant_id);
CREATE INDEX idx_avos_menu_index_menu_item_id ON avos_menu_index(menu_item_id);
CREATE INDEX idx_avos_menu_index_gin_search_vector ON avos_menu_index USING GIN(search_vector);
CREATE INDEX idx_avos_menu_index_gin_aliases ON avos_menu_index USING GIN(aliases);
CREATE INDEX idx_avos_menu_index_category ON avos_menu_index(restaurant_id, category);
CREATE INDEX idx_avos_menu_index_available ON avos_menu_index(restaurant_id, is_available);

-- Trigger to update search_vector automatically
CREATE OR REPLACE FUNCTION update_avos_menu_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector(
    'english',
    COALESCE(NEW.item_name, '') || ' ' ||
    COALESCE(NEW.item_name_zh, '') || ' ' ||
    COALESCE(NEW.item_name_yue, '') || ' ' ||
    COALESCE(NEW.item_name_es, '') || ' ' ||
    COALESCE(NEW.category, '')
  );
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER avos_menu_search_vector_trigger
BEFORE INSERT OR UPDATE ON avos_menu_index
FOR EACH ROW
EXECUTE FUNCTION update_avos_menu_search_vector();

-- ============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all AVOS tables
ALTER TABLE avos_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE avos_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE avos_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE avos_menu_index ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- avos_calls RLS Policies
-- ============================================================================
CREATE POLICY "avos_calls_select_authenticated"
  ON avos_calls FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_restaurants.restaurant_id = avos_calls.restaurant_id
        AND user_restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "avos_calls_full_access_service_role"
  ON avos_calls FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- avos_orders RLS Policies
-- ============================================================================
CREATE POLICY "avos_orders_select_authenticated"
  ON avos_orders FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_restaurants.restaurant_id = avos_orders.restaurant_id
        AND user_restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "avos_orders_insert_authenticated"
  ON avos_orders FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_restaurants.restaurant_id = avos_orders.restaurant_id
        AND user_restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "avos_orders_update_authenticated"
  ON avos_orders FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_restaurants.restaurant_id = avos_orders.restaurant_id
        AND user_restaurants.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_restaurants.restaurant_id = avos_orders.restaurant_id
        AND user_restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "avos_orders_full_access_service_role"
  ON avos_orders FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- avos_config RLS Policies
-- ============================================================================
CREATE POLICY "avos_config_select_authenticated"
  ON avos_config FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_restaurants.restaurant_id = avos_config.restaurant_id
        AND user_restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "avos_config_insert_authenticated"
  ON avos_config FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_restaurants.restaurant_id = avos_config.restaurant_id
        AND user_restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "avos_config_update_authenticated"
  ON avos_config FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_restaurants.restaurant_id = avos_config.restaurant_id
        AND user_restaurants.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_restaurants.restaurant_id = avos_config.restaurant_id
        AND user_restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "avos_config_full_access_service_role"
  ON avos_config FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- avos_menu_index RLS Policies
-- ============================================================================
CREATE POLICY "avos_menu_index_select_authenticated"
  ON avos_menu_index FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_restaurants.restaurant_id = avos_menu_index.restaurant_id
        AND user_restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "avos_menu_index_insert_authenticated"
  ON avos_menu_index FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_restaurants.restaurant_id = avos_menu_index.restaurant_id
        AND user_restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "avos_menu_index_update_authenticated"
  ON avos_menu_index FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_restaurants.restaurant_id = avos_menu_index.restaurant_id
        AND user_restaurants.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_restaurants.restaurant_id = avos_menu_index.restaurant_id
        AND user_restaurants.user_id = auth.uid()
    )
  );

CREATE POLICY "avos_menu_index_full_access_service_role"
  ON avos_menu_index FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE avos_calls IS 'Track all incoming voice calls to AVOS system with full transcript and metadata';
COMMENT ON TABLE avos_orders IS 'Orders placed via voice with payment tracking and blockchain integration';
COMMENT ON TABLE avos_config IS 'Per-restaurant AVOS configuration and feature toggles';
COMMENT ON TABLE avos_menu_index IS 'Optimized menu lookup with multilingual support and phonetic matching';

COMMENT ON COLUMN avos_calls.transcript IS 'Array of {role, text, language, timestamp, confidence?} objects';
COMMENT ON COLUMN avos_orders.items IS 'Array of {menuItemId, name, quantity, priceUsd, modifications} objects';
COMMENT ON COLUMN avos_config.greeting_message IS 'Localized greeting messages keyed by language code';
COMMENT ON COLUMN avos_config.supported_languages IS 'Array of language codes supported for this restaurant';
COMMENT ON COLUMN avos_menu_index.aliases IS 'Array of alternative names for menu items (e.g., nicknames, alternate spellings)';
COMMENT ON COLUMN avos_menu_index.phonetic_zh IS 'Pinyin romanization for Chinese menu items';
COMMENT ON COLUMN avos_menu_index.phonetic_yue IS 'Jyutping romanization for Cantonese menu items';
