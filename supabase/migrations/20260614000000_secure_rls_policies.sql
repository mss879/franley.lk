-- Drop old policies to prevent duplicates
DROP POLICY IF EXISTS "Allow admin write access" ON products;
DROP POLICY IF EXISTS "Allow admin write access" ON collections;
DROP POLICY IF EXISTS "Allow admin write access" ON collection_products;
DROP POLICY IF EXISTS "Allow select for authenticated admins" ON orders;
DROP POLICY IF EXISTS "Allow update for authenticated admins" ON orders;
DROP POLICY IF EXISTS "Allow select for authenticated admins" ON contact_inquiries;
DROP POLICY IF EXISTS "Allow delete for authenticated admins" ON contact_inquiries;
DROP POLICY IF EXISTS "Allow insert for authenticated admins" ON marquee_offers;
DROP POLICY IF EXISTS "Allow delete for authenticated admins" ON marquee_offers;
DROP POLICY IF EXISTS "Allow read for authenticated admins" ON analytics_visits;

-- Create secure policies that check for verified admin email
CREATE POLICY "Allow admin write access" ON products
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@franley.lk')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@franley.lk');

CREATE POLICY "Allow admin write access" ON collections
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@franley.lk')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@franley.lk');

CREATE POLICY "Allow admin write access" ON collection_products
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@franley.lk')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@franley.lk');

CREATE POLICY "Allow select for authenticated admins" ON orders
    FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@franley.lk');

CREATE POLICY "Allow update for authenticated admins" ON orders
    FOR UPDATE TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@franley.lk');

CREATE POLICY "Allow select for authenticated admins" ON contact_inquiries
    FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@franley.lk');

CREATE POLICY "Allow delete for authenticated admins" ON contact_inquiries
    FOR DELETE TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@franley.lk');

CREATE POLICY "Allow insert for authenticated admins" ON marquee_offers
    FOR INSERT TO authenticated
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@franley.lk');

CREATE POLICY "Allow delete for authenticated admins" ON marquee_offers
    FOR DELETE TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@franley.lk');

CREATE POLICY "Allow read for authenticated admins" ON analytics_visits
    FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@franley.lk');
