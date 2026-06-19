-- Create Collections Table
CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('manual', 'smart')),
    rules JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Collection Products Join Table (for manual associations)
CREATE TABLE IF NOT EXISTS collection_products (
    collection_id TEXT REFERENCES collections(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (collection_id, product_id)
);

-- Seed Collections Table
INSERT INTO collections (id, name, description, type, rules)
VALUES
(
    'audio-elite',
    'Audio Elite',
    'Broadcast quality mics, reference studio monitors, and comfort-focused ANC headphones.',
    'smart',
    '{"tags": ["audio"]}'::jsonb
),
(
    'desk-accessories',
    'Desk Accessories',
    'Elevate your desk layout with premium work gear.',
    'smart',
    '{"tags": ["gear"]}'::jsonb
),
(
    'creator-bundle',
    'Creator Essentials Bundle',
    'The ultimate starter pack for streaming and programming.',
    'manual',
    '{}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    rules = EXCLUDED.rules,
    updated_at = timezone('utc'::text, now());

-- Seed manual collection products associations
INSERT INTO collection_products (collection_id, product_id)
VALUES
('creator-bundle', 'keyboard'),
('creator-bundle', 'mouse'),
('creator-bundle', 'mic')
ON CONFLICT DO NOTHING;
