-- Create storage bucket for products if it does not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if any to avoid duplication errors
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;

-- Enable storage public access for viewing/downloading images
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'products');

-- Enable admin access for uploading/modifying product images
CREATE POLICY "Admin Insert Access" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'products');

CREATE POLICY "Admin Update Access" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'products');

CREATE POLICY "Admin Delete Access" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'products');
