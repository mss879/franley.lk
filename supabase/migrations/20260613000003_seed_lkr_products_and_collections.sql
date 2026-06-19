-- Seed/re-seed Products with LKR prices
INSERT INTO products (id, name, category, price, slashed_price, discount, description, color, colors, images, tags, features, meta_title)
VALUES
(
    'headphones',
    'Pro Noise-Cancelling Headphones',
    'Audio',
    90000.00,
    120000.00,
    '25% OFF',
    'Studio-grade sound, ultimate comfort & active noise cancellation.',
    'purple',
    ARRAY['Space Purple', 'Matte Black', 'Silver Gray'],
    ARRAY['/products/headphones.webp'],
    ARRAY['audio', 'headphones', 'premium', 'wireless', 'anc'],
    ARRAY['Active Noise Cancellation', 'Studio-grade sound', '40-hour Battery'],
    'Pro Noise-Cancelling Headphones | Franley Premium Audio'
),
(
    'charger',
    'Smart Dual Wireless Charger',
    'Power',
    27000.00,
    36000.00,
    '25% OFF',
    'Fast-charging pad for your phone and watch with a sleek leather surface.',
    'amber',
    ARRAY['Carbon Black', 'Arctic White'],
    ARRAY['/products/charger.webp'],
    ARRAY['power', 'charger', 'wireless', 'magsafe', 'leather'],
    ARRAY['Fast Dual Charging', 'Leather Surface', 'MagSafe Compatible'],
    'Smart Dual Wireless Charger | Franley Premium Power'
),
(
    'keyboard',
    'Creations Mechanical Keyboard',
    'Gear',
    48000.00,
    63000.00,
    '24% OFF',
    'Hot-swappable tactile switches, wooden base frame, retro keycaps.',
    'blue',
    ARRAY['Onyx Black', 'Chalk White', 'Neon Purple'],
    ARRAY['/products/keyboard.webp'],
    ARRAY['gear', 'keyboard', 'mechanical', 'retro', 'tactile'],
    ARRAY['Tactile Blue Switches', 'Solid Wooden Frame', 'Retro Keycaps'],
    'Creations Mechanical Keyboard | Franley Premium Gear'
),
(
    'sleeve',
    'Minimalist Tech Sleeve',
    'Travel',
    13500.00,
    18000.00,
    '25% OFF',
    'Water-resistant canvas organizer for cords, power banks, and cards.',
    'emerald',
    ARRAY['Ash Grey', 'Midnight Black'],
    ARRAY['/products/sleeve.webp'],
    ARRAY['travel', 'sleeve', 'organizer', 'waterproof'],
    ARRAY['Water-resistant Canvas', 'Multi-pocket Layout', 'YKK Zippers'],
    'Minimalist Tech Sleeve | Franley Premium Travel'
),
(
    'lightbar',
    'Ambient LED Desk Bar',
    'Lighting',
    24000.00,
    33000.00,
    '28% OFF',
    'Monitor-mounted lighting with smart hue adjustment and music sync.',
    'pink',
    ARRAY['Matte Black', 'Silver'],
    ARRAY['/products/lightbar.webp'],
    ARRAY['lighting', 'lightbar', 'desk', 'rgb', 'smart'],
    ARRAY['Anti-glare Design', 'Music Sync Feature', 'Smart Hue Control'],
    'Ambient LED Desk Bar | Franley Premium Lighting'
),
(
    'riser',
    'Carbon Fiber Laptop Lift',
    'Gear',
    19500.00,
    27000.00,
    '27% OFF',
    'Lightweight, ultra-durable carbon fiber laptop riser.',
    'slate',
    ARRAY['Silver Gray', 'Charcoal Black'],
    ARRAY['/products/riser.webp'],
    ARRAY['gear', 'riser', 'laptop', 'carbon', 'ergonomic'],
    ARRAY['Carbon Fiber Build', 'Ergonomic Layout', 'Non-slip Pads'],
    'Carbon Fiber Laptop Lift | Franley Premium Gear'
),
(
    'mouse',
    'Precision Workspace Mouse',
    'Gear',
    39000.00,
    54000.00,
    '28% OFF',
    'Ergonomic workspace mouse with smart scroll wheel and silent clicks.',
    'slate',
    ARRAY['Onyx Black', 'Chalk White'],
    ARRAY['/products/mouse.webp'],
    ARRAY['gear', 'mouse', 'precision', 'silent', 'wireless'],
    ARRAY['Smart Scroll Wheel', 'Precision Sensor', 'Silent Clicks'],
    'Precision Workspace Mouse | Franley Premium Gear'
),
(
    'speaker',
    'Hi-Fi Studio Monitor Speaker',
    'Audio',
    105000.00,
    138000.00,
    '24% OFF',
    'High-resolution desktop monitor speakers with premium carbon cone drivers.',
    'purple',
    ARRAY['Onyx Black', 'Lunar Grey'],
    ARRAY['/products/speaker.webp'],
    ARRAY['audio', 'speaker', 'studio', 'hifi', 'wooden'],
    ARRAY['Hi-Fi Audio Drivers', 'Carbon Cone Woofers', 'Wooden Cabinet'],
    'Hi-Fi Studio Monitor Speaker | Franley Premium Audio'
),
(
    'webcam',
    '4K Creator Webcam',
    'Video',
    60000.00,
    81000.00,
    '26% OFF',
    'Ultra-wide 4K webcam with automatic framing and high dynamic range.',
    'blue',
    ARRAY['Onyx Black', 'Frost White', 'Space Purple'],
    ARRAY['/products/webcam.webp'],
    ARRAY['video', 'webcam', '4k', 'hdr', 'creator'],
    ARRAY['4K Ultra HD Sensor', 'Auto-framing Tech', 'HDR Support'],
    '4K Creator Webcam | Franley Premium Video'
),
(
    'mic',
    'USB Condenser Microphone',
    'Audio',
    54000.00,
    72000.00,
    '25% OFF',
    'Cardioid condenser microphone with dynamic noise suppression filter.',
    'emerald',
    ARRAY['Onyx Black', 'Frost White', 'Space Purple'],
    ARRAY['/products/mic.webp'],
    ARRAY['audio', 'mic', 'microphone', 'usb', 'rgb'],
    ARRAY['Cardioid Pattern', 'Built-in Pop Filter', 'RGB Live Indicator'],
    'USB Condenser Microphone | Franley Premium Audio'
),
(
    'stand',
    'MagSafe Desk Mount',
    'Power',
    15000.00,
    21000.00,
    '30% OFF',
    'Magnetic phone mount machined from solid aerospace-grade aluminum.',
    'amber',
    ARRAY['Silver Gray', 'Charcoal Black'],
    ARRAY['/products/stand.webp'],
    ARRAY['power', 'stand', 'magsafe', 'magnetic', 'aluminum'],
    ARRAY['Solid Aerospace Alum', 'N52 Neodymium Magnets', '360° Rotation'],
    'MagSafe Desk Mount | Franley Premium Power'
),
(
    'backpack',
    'Urban Tech Backpack',
    'Travel',
    42000.00,
    57000.00,
    '26% OFF',
    'Weatherproof layout with dedicated laptop compartment and luggage pass-through.',
    'slate',
    ARRAY['Slate Grey', 'Onyx Black'],
    ARRAY['/products/backpack.webp'],
    ARRAY['travel', 'backpack', 'bag', 'weatherproof', 'anti-theft'],
    ARRAY['Weatherproof Exterior', 'Luggage Pass-through', 'Anti-theft Pocket'],
    'Urban Tech Backpack | Franley Premium Travel'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    price = EXCLUDED.price,
    slashed_price = EXCLUDED.slashed_price,
    discount = EXCLUDED.discount,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    colors = EXCLUDED.colors,
    images = EXCLUDED.images,
    tags = EXCLUDED.tags,
    features = EXCLUDED.features,
    meta_title = EXCLUDED.meta_title,
    updated_at = timezone('utc'::text, now());

-- Seed/re-seed Collections
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
