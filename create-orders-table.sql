-- Create orders table in Supabase
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    customer_info JSONB NOT NULL,
    user_info JSONB,
    design_image_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered')),
    weidian_order_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Enable RLS (Row Level Security) - optional
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow service role to access all orders (for admin dashboard)
CREATE POLICY IF NOT EXISTS "Service role can access all orders" ON orders
FOR ALL USING (auth.role() = 'service_role');

-- Sample test data
INSERT INTO orders (order_id, user_id, product_name, price, customer_info, user_info, design_image_url, status)
VALUES 
('PO-test-001', 'guest', '测试卫衣 - M码', 99.00, 
 '{"name": "测试用户", "phone": "13800138000", "email": "test@example.com", "address": "测试地址", "notes": "测试备注"}',
 '{"firstName": "Test", "lastName": "User", "email": "test@example.com"}',
 'https://example.com/test-design.jpg', 'pending'
);

-- Verify the table was created correctly
SELECT * FROM orders LIMIT 5;