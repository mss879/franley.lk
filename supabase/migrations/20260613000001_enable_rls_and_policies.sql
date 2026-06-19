-- Enable Row Level Security on Catalog tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid duplication errors
DROP POLICY IF EXISTS "Allow public read access" ON products;
DROP POLICY IF EXISTS "Allow admin write access" ON products;
DROP POLICY IF EXISTS "Allow public read access" ON collections;
DROP POLICY IF EXISTS "Allow admin write access" ON collections;
DROP POLICY IF EXISTS "Allow public read access" ON collection_products;
DROP POLICY IF EXISTS "Allow admin write access" ON collection_products;

-- Create Policies for products
CREATE POLICY "Allow public read access" ON products
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Allow admin write access" ON products
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create Policies for collections
CREATE POLICY "Allow public read access" ON collections
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Allow admin write access" ON collections
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create Policies for collection_products
CREATE POLICY "Allow public read access" ON collection_products
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Allow admin write access" ON collection_products
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);
