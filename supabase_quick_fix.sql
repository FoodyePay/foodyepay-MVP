-- 🔄 FoodyePay - Quick Database Fix
-- 在 Supabase SQL Editor 中运行此脚本

-- 删除现有表（如果存在）
DROP TABLE IF EXISTS public.restaurants CASCADE;
DROP TABLE IF EXISTS public.diners CASCADE;

-- 创建 diners 表
CREATE TABLE public.diners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    wallet_address TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'diner'
);

-- 创建 restaurants 表（包含所有需要的字段）
CREATE TABLE public.restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    name TEXT NOT NULL,
    ein TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    street_number TEXT NOT NULL,
    street_name TEXT NOT NULL,
    suite_apt TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    wallet_address TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'restaurant',
    hours TEXT,
    description TEXT
);

-- 创建索引
CREATE INDEX idx_diners_wallet ON public.diners(wallet_address);
CREATE INDEX idx_restaurants_wallet ON public.restaurants(wallet_address);
CREATE INDEX idx_restaurants_ein ON public.restaurants(ein);

-- 启用 RLS
ALTER TABLE public.diners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- 创建允许所有操作的策略
CREATE POLICY "Allow all operations" ON public.diners FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON public.restaurants FOR ALL USING (true);
