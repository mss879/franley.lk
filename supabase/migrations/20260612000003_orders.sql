-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    items JSONB NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'shipped', 'delivered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anonymous order inserts" ON orders;
DROP POLICY IF EXISTS "Allow select for authenticated admins" ON orders;
DROP POLICY IF EXISTS "Allow update for authenticated admins" ON orders;

-- Create Policies
-- Allow anyone (including anonymous users checkouts) to create orders
CREATE POLICY "Allow anonymous order inserts" ON orders
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Allow authenticated admins to view all orders
CREATE POLICY "Allow select for authenticated admins" ON orders
    FOR SELECT TO authenticated
    USING (true);

-- Allow authenticated admins to update orders (for status transitions)
CREATE POLICY "Allow update for authenticated admins" ON orders
    FOR UPDATE TO authenticated
    USING (true);

-- Seed Orders Table with Mock Orders
INSERT INTO orders (id, customer_name, customer_email, shipping_address, items, total_amount, status, created_at)
VALUES
(
    'ORD-20260612-921A',
    'Sarah Jenkins',
    'sarah.j@example.com',
    '1524 Pine Street, San Francisco, CA, 94109',
    '[{"id":"headphones","name":"Pro Noise-Cancelling Headphones","color":"Space Purple","quantity":1,"price":"$299"}]'::jsonb,
    299.00,
    'pending',
    now() - interval '4 hours'
),
(
    'ORD-20260611-304B',
    'Alex Rivera',
    'alex.rivera@example.com',
    '892 Broadway Apt 4B, New York, NY, 10003',
    '[{"id":"keyboard","name":"Creations Mechanical Keyboard","color":"Onyx Black","quantity":1,"price":"$159"},{"id":"charger","name":"Smart Dual Wireless Charger","color":"Carbon Black","quantity":1,"price":"$89"}]'::jsonb,
    248.00,
    'shipped',
    now() - interval '1 day'
),
(
    'ORD-20260610-855C',
    'Evelyn Chen',
    'evelyn.chen@gmail.com',
    '724 Olympic Blvd, Los Angeles, CA, 90015',
    '[{"id":"backpack","name":"Urban Tech Backpack","color":"Slate Grey","quantity":1,"price":"$139"}]'::jsonb,
    139.00,
    'delivered',
    now() - interval '2 days'
)
ON CONFLICT (id) DO UPDATE SET
    customer_name = EXCLUDED.customer_name,
    customer_email = EXCLUDED.customer_email,
    shipping_address = EXCLUDED.shipping_address,
    items = EXCLUDED.items,
    total_amount = EXCLUDED.total_amount,
    status = EXCLUDED.status,
    updated_at = timezone('utc'::text, now());
