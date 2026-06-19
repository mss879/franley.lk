-- Create Analytics Visits Table
CREATE TABLE IF NOT EXISTS analytics_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path TEXT NOT NULL,
    referrer TEXT NOT NULL,
    user_agent TEXT,
    ip TEXT,
    country TEXT DEFAULT 'Unknown',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE analytics_visits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anonymous visits insert" ON analytics_visits;
DROP POLICY IF EXISTS "Allow read for authenticated admins" ON analytics_visits;
DROP POLICY IF EXISTS "Allow service role full access" ON analytics_visits;

-- Create Policies
-- Allow anyone (anonymous users) to insert tracking logs
CREATE POLICY "Allow anonymous visits insert" ON analytics_visits
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Allow admins (authenticated users or service role) to view tracking data
CREATE POLICY "Allow read for authenticated admins" ON analytics_visits
    FOR SELECT TO authenticated
    USING (true);

-- Add some dummy analytics data for showcases
INSERT INTO analytics_visits (path, referrer, user_agent, country, created_at)
VALUES
('/', 'direct', 'Mozilla/5.0...', 'United States', now() - interval '6 days'),
('/product/headphones', 'google.com', 'Mozilla/5.0...', 'United States', now() - interval '6 days'),
('/product/keyboard', 'instagram.com', 'Mozilla/5.0...', 'United Kingdom', now() - interval '5 days'),
('/', 'youtube.com', 'Mozilla/5.0...', 'Canada', now() - interval '5 days'),
('/product/charger', 'direct', 'Mozilla/5.0...', 'Germany', now() - interval '4 days'),
('/product/mic', 'twitter.com', 'Mozilla/5.0...', 'Australia', now() - interval '4 days'),
('/product/headphones', 'google.com', 'Mozilla/5.0...', 'Japan', now() - interval '3 days'),
('/', 'instagram.com', 'Mozilla/5.0...', 'India', now() - interval '3 days'),
('/product/backpack', 'linkedin.com', 'Mozilla/5.0...', 'United States', now() - interval '2 days'),
('/product/sleeve', 'direct', 'Mozilla/5.0...', 'Singapore', now() - interval '2 days'),
('/', 'google.com', 'Mozilla/5.0...', 'United States', now() - interval '1 day'),
('/product/keyboard', 'youtube.com', 'Mozilla/5.0...', 'Brazil', now() - interval '1 day'),
('/product/mouse', 'direct', 'Mozilla/5.0...', 'France', now()),
('/product/speaker', 'twitter.com', 'Mozilla/5.0...', 'United States', now());
