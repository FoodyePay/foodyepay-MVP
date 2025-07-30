-- 🔄 FoodyePay Database Schema Update
-- 重新整理数据库结构以支持完整的注册流程

-- 首先删除现有表（如果存在）
DROP TABLE IF EXISTS public.restaurants CASCADE;
DROP TABLE IF EXISTS public.diners CASCADE;

-- 创建 diners 表
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

-- 创建 restaurants 表
CREATE TABLE public.restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 餐厅基本信息
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    name TEXT NOT NULL, -- 餐厅名称
    
    -- 商业验证信息
    ein TEXT NOT NULL UNIQUE, -- Employer Identification Number
    
    -- 地址信息 (USPS 标准格式)
    address TEXT NOT NULL, -- 完整格式化地址
    
    -- 详细地址组件
    street_number TEXT NOT NULL,
    street_name TEXT NOT NULL,
    suite_apt TEXT, -- 可选的套房/单元号
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    
    -- Web3 信息
    wallet_address TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'restaurant' CHECK (role = 'restaurant'),
    
    -- 可选的餐厅信息
    hours TEXT, -- 营业时间
    description TEXT, -- 餐厅描述
    
    -- 元数据
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_diners_wallet_address ON public.diners(wallet_address);
CREATE INDEX idx_diners_email ON public.diners(email);

CREATE INDEX idx_restaurants_wallet_address ON public.restaurants(wallet_address);
CREATE INDEX idx_restaurants_email ON public.restaurants(email);
CREATE INDEX idx_restaurants_ein ON public.restaurants(ein);
CREATE INDEX idx_restaurants_city ON public.restaurants(city);
CREATE INDEX idx_restaurants_state ON public.restaurants(state);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为两个表添加更新时间触发器
CREATE TRIGGER update_diners_updated_at 
    BEFORE UPDATE ON public.diners 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at 
    BEFORE UPDATE ON public.restaurants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入一些测试数据
INSERT INTO public.restaurants (
    email, 
    phone, 
    name, 
    ein, 
    address,
    street_number,
    street_name,
    suite_apt,
    city,
    state,
    zip_code,
    wallet_address
) VALUES 
(
    'fan@szechuancuisine.com',
    '1-212-555-0123',
    'FAN SZECHUAN CUISINE INC.',
    '93-4482803',
    '123 Main St, New York, NY 10001',
    '123',
    'Main St',
    NULL,
    'New York',
    'NY',
    '10001',
    '0x1234567890123456789012345678901234567890'
),
(
    'manager@mcdonalds.com',
    '1-555-123-4567',
    'McDonald''s Corporation',
    '12-3456789',
    '456 Oak Ave, Chicago, IL 60601',
    '456',
    'Oak Ave',
    NULL,
    'Chicago',
    'IL',
    '60601',
    '0xABCDEF1234567890123456789012345678901234'
);

-- 启用 Row Level Security (RLS)
ALTER TABLE public.diners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- 创建基本的 RLS 策略 (允许所有操作，稍后可以根据需要限制)
CREATE POLICY "Allow all operations on diners" ON public.diners
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on restaurants" ON public.restaurants
    FOR ALL USING (true) WITH CHECK (true);

-- 显示表结构确认
\d public.diners
\d public.restaurants

-- 验证插入的测试数据
SELECT 'Restaurants Count:' as info, COUNT(*) as count FROM public.restaurants;
SELECT 'Diners Count:' as info, COUNT(*) as count FROM public.diners;

-- 显示餐厅测试数据
SELECT name, ein, city, state, wallet_address FROM public.restaurants;
