-- Create Contact Inquiries Table
CREATE TABLE IF NOT EXISTS contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('general_inquiries', 'product_inquiries', 'shipping_inquiries')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow anonymous inquiries insert" ON contact_inquiries;
DROP POLICY IF EXISTS "Allow select for authenticated admins" ON contact_inquiries;
DROP POLICY IF EXISTS "Allow delete for authenticated admins" ON contact_inquiries;

-- Create Policies
-- Allow anyone (including anonymous users submitting the contact form) to create inquiries
CREATE POLICY "Allow anonymous inquiries insert" ON contact_inquiries
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Allow authenticated admins to view all inquiries
CREATE POLICY "Allow select for authenticated admins" ON contact_inquiries
    FOR SELECT TO authenticated
    USING (true);

-- Allow authenticated admins to delete inquiries
CREATE POLICY "Allow delete for authenticated admins" ON contact_inquiries
    FOR DELETE TO authenticated
    USING (true);

-- Seed Contact Inquiries Table with Mock Data
INSERT INTO contact_inquiries (name, email, reason, message, created_at)
VALUES
(
    'Liam Johnson',
    'liam.johnson@example.com',
    'general_inquiries',
    'Hello, I love your workspace aesthetic! Do you offer bulk discounts for corporate setup upgrades?',
    now() - interval '1 day'
),
(
    'Sophia Smith',
    'sophia.smith@example.com',
    'product_inquiries',
    'Hi, is the mechanical keyboard compatible with macOS function keys out of the box?',
    now() - interval '12 hours'
),
(
    'Jackson Davis',
    'jackson.davis@example.com',
    'shipping_inquiries',
    'Hello, do you ship to international locations like Switzerland and Germany? If so, what is the ETA?',
    now() - interval '2 hours'
)
ON CONFLICT (id) DO NOTHING;
