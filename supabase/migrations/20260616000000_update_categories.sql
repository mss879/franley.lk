-- Migration to update product categories to match new categories:
-- 'Home and kitchen', 'Tech & Gadgets', 'Mobile & Auto', 'Best sellers', 'Trending'

UPDATE products SET category = 'Best sellers' WHERE id IN ('headphones', 'keyboard');
UPDATE products SET category = 'Tech & Gadgets' WHERE id IN ('charger', 'sleeve', 'riser', 'mouse');
UPDATE products SET category = 'Home and kitchen' WHERE id IN ('lightbar', 'speaker');
UPDATE products SET category = 'Trending' WHERE id IN ('webcam', 'mic');
UPDATE products SET category = 'Mobile & Auto' WHERE id IN ('stand', 'backpack');
