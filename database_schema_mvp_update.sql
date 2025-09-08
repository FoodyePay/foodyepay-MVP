-- 🔄 FoodyePay Database Schema Update for MVP
-- 更新数据库结构以支持 Google Maps + Twilio 验证流程

-- 首先删除现有表（如果存在）
DROP TABLE IF EXISTS public.restaurants CASCADE;
DROP TABLE IF EXISTS public.diners CASCADE;

-- 创建 diners 表（保持不变）
CREATE TABLE public.diners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 用户基本信息
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    
    -- Web3 信息
    wallet_address TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'diner' CHECK (role = 'diner'),
    
    -- 元数据
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 restaurants 表 - 新的 MVP 结构
CREATE TABLE public.restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 餐厅基本信息
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL, -- Twilio 验证的电话号码
    name TEXT NOT NULL, -- 餐厅名称
    
    -- Google Maps 验证信息
    google_place_id TEXT NOT NULL UNIQUE, -- Google Places ID，防止重复注册
    address TEXT NOT NULL, -- Google Maps 提供的格式化地址
    rating DECIMAL(2,1) DEFAULT 0, -- Google Maps 评分
    user_ratings_total INTEGER DEFAULT 0, -- 评价总数
    
    -- 可选的 Google Maps 数据
    business_status TEXT, -- 营业状态
    price_level INTEGER, -- 价格等级
    
    -- Web3 信息
    wallet_address TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'restaurant' CHECK (role = 'restaurant'),
    
    -- 验证状态
    phone_verified BOOLEAN DEFAULT TRUE, -- Twilio 验证状态
    business_verified BOOLEAN DEFAULT TRUE, -- Google Maps 验证状态
    
    -- 元数据
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_diners_wallet_address ON public.diners(wallet_address);
CREATE INDEX idx_diners_email ON public.diners(email);

CREATE INDEX idx_restaurants_wallet_address ON public.restaurants(wallet_address);
CREATE INDEX idx_restaurants_email ON public.restaurants(email);
CREATE INDEX idx_restaurants_google_place_id ON public.restaurants(google_place_id);
CREATE INDEX idx_restaurants_phone ON public.restaurants(phone);

-- 设置 RLS (Row Level Security) 策略
ALTER TABLE public.diners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- 允许读取所有记录（用于认证检查）
CREATE POLICY "Allow read access for all users" ON public.diners
    FOR SELECT USING (true);

CREATE POLICY "Allow read access for all users" ON public.restaurants
    FOR SELECT USING (true);

-- 允许插入新记录
CREATE POLICY "Allow insert for authenticated users" ON public.diners
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow insert for authenticated users" ON public.restaurants
    FOR INSERT WITH CHECK (true);

-- 允许用户更新自己的记录
CREATE POLICY "Allow update for own records" ON public.diners
    FOR UPDATE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Allow update for own records" ON public.restaurants
    FOR UPDATE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- 创建函数来检查用户是否已注册
CREATE OR REPLACE FUNCTION check_user_registration(wallet_addr TEXT)
RETURNS TABLE(role TEXT, user_data JSONB) AS $$
BEGIN
    -- 检查是否为 diner
    RETURN QUERY
    SELECT 'diner'::TEXT as role, to_jsonb(d.*) as user_data
    FROM public.diners d
    WHERE d.wallet_address = wallet_addr;
    
    -- 如果没有找到 diner，检查是否为 restaurant
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 'restaurant'::TEXT as role, to_jsonb(r.*) as user_data
        FROM public.restaurants r
        WHERE r.wallet_address = wallet_addr;
    END IF;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器函数来自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为两个表创建触发器
CREATE TRIGGER update_diners_updated_at
    BEFORE UPDATE ON public.diners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 显示创建的表结构
\d public.diners;
\d public.restaurants;

-- 测试函数
SELECT check_user_registration('0x1234567890123456789012345678901234567890');

COMMENT ON TABLE public.diners IS 'FoodyePay platform diners with simplified registration';
COMMENT ON TABLE public.restaurants IS 'FoodyePay platform restaurants verified via Google Maps and Twilio';
COMMENT ON COLUMN public.restaurants.google_place_id IS 'Unique Google Places ID to prevent duplicate registrations';
COMMENT ON COLUMN public.restaurants.phone IS 'Phone number verified via Twilio SMS/Voice';
COMMENT ON FUNCTION check_user_registration(TEXT) IS 'Check if wallet address is registered and return role + data';
