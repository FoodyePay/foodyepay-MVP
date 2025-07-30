-- Restaurant Dashboard Database Schema
-- Run this in your Supabase SQL Editor

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_usd DECIMAL(10,2) NOT NULL,
  price_foody DECIMAL(10,2),
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table (if not exists)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diner_id UUID NOT NULL REFERENCES diners(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  items JSONB NOT NULL, -- Array of order items with quantities
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  table_number VARCHAR(20),
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table (if not exists)
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  diner_id UUID NOT NULL REFERENCES diners(id) ON DELETE CASCADE,
  amount DECIMAL(20,8) NOT NULL, -- Support high precision for crypto
  token_symbol VARCHAR(20) NOT NULL, -- USDC, FOODY, ETH, etc.
  token_address VARCHAR(42), -- Ethereum address for the token
  transaction_hash VARCHAR(66), -- Blockchain transaction hash
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_method VARCHAR(50) DEFAULT 'crypto',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create purchases table for FOODY token transactions
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diner_id UUID NOT NULL REFERENCES diners(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  amount_usdc DECIMAL(10,2) NOT NULL,
  amount_foody DECIMAL(20,8) NOT NULL,
  transaction_hash VARCHAR(66),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);

CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_diner_id ON orders(diner_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_payments_restaurant_id ON payments(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_payments_diner_id ON payments(diner_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_purchases_diner_id ON purchases(diner_id);
CREATE INDEX IF NOT EXISTS idx_purchases_restaurant_id ON purchases(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_items
CREATE POLICY "Public can view available menu items" ON menu_items
  FOR SELECT USING (is_available = true);

CREATE POLICY "Restaurants can manage their menu items" ON menu_items
  FOR ALL USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE wallet_address = auth.jwt() ->> 'wallet_address'
    )
  );

-- RLS Policies for orders  
CREATE POLICY "Restaurants can view their orders" ON orders
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE wallet_address = auth.jwt() ->> 'wallet_address'
    )
  );

CREATE POLICY "Restaurants can update their orders" ON orders
  FOR UPDATE USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE wallet_address = auth.jwt() ->> 'wallet_address'
    )
  );

CREATE POLICY "Diners can view their orders" ON orders
  FOR SELECT USING (
    diner_id IN (
      SELECT id FROM diners WHERE wallet_address = auth.jwt() ->> 'wallet_address'
    )
  );

CREATE POLICY "Diners can create orders" ON orders
  FOR INSERT WITH CHECK (
    diner_id IN (
      SELECT id FROM diners WHERE wallet_address = auth.jwt() ->> 'wallet_address'
    )
  );

-- RLS Policies for payments
CREATE POLICY "Restaurants can view their payments" ON payments
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE wallet_address = auth.jwt() ->> 'wallet_address'
    )
  );

CREATE POLICY "Diners can view their payments" ON payments
  FOR SELECT USING (
    diner_id IN (
      SELECT id FROM diners WHERE wallet_address = auth.jwt() ->> 'wallet_address'
    )
  );

-- RLS Policies for purchases
CREATE POLICY "Diners can view their purchases" ON purchases
  FOR SELECT USING (
    diner_id IN (
      SELECT id FROM diners WHERE wallet_address = auth.jwt() ->> 'wallet_address'
    )
  );

CREATE POLICY "Restaurants can view purchases at their restaurant" ON purchases
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE wallet_address = auth.jwt() ->> 'wallet_address'
    )
  );

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
