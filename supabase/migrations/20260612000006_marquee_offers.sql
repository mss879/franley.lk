-- Create Marquee Offers Table
CREATE TABLE IF NOT EXISTS marquee_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    row_number INTEGER NOT NULL CHECK (row_number IN (1, 2)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE marquee_offers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anonymous offers select" ON marquee_offers;
DROP POLICY IF EXISTS "Allow insert for authenticated admins" ON marquee_offers;
DROP POLICY IF EXISTS "Allow delete for authenticated admins" ON marquee_offers;

-- Create Policies
-- Allow anyone to view marquee offers on storefront
CREATE POLICY "Allow anonymous offers select" ON marquee_offers
    FOR SELECT TO anon, authenticated
    USING (true);

-- Allow authenticated admins to insert new offers
CREATE POLICY "Allow insert for authenticated admins" ON marquee_offers
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Allow authenticated admins to delete offers
CREATE POLICY "Allow delete for authenticated admins" ON marquee_offers
    FOR DELETE TO authenticated
    USING (true);

-- Seed Marquee Offers Table with Sales and Offers
INSERT INTO marquee_offers (text, row_number)
VALUES
('Summer Sale: 20% Off All Audio Devices', 1),
('Free Delivery on orders over $150', 1),
('Use Code CREATE20 for extra discounts', 1),
('Limited stock on mechanical keyboards', 1),
('Premium creator bundles now available', 1),
('Elevate your desk setup with 15% off', 1),
('Tactile switches special promotion active', 1),
('Shop the high performance range', 1),
('Exclusive subscriber discounts inside', 2),
('Buy now and pay later with zero interest', 2),
('Ambient LED lightbars: 30% discount', 2),
('Carbon fiber monitor risers special offer', 2),
('Upgrade to studio audio today', 2),
('All desk accessories starting at $29', 2),
('Smart wireless chargers best price', 2),
('Water resistant travel cases on sale', 2);
