-- Migration to convert prices in products table to Sri Lankan Rupees (LKR)
-- Conversion rate: 1 USD = 300 LKR (rounded for standard pricing)

UPDATE products
SET 
    price = CASE 
        WHEN id = 'headphones' THEN 90000.00
        WHEN id = 'charger' THEN 27000.00
        WHEN id = 'keyboard' THEN 48000.00
        WHEN id = 'sleeve' THEN 13500.00
        WHEN id = 'lightbar' THEN 24000.00
        WHEN id = 'riser' THEN 19500.00
        WHEN id = 'mouse' THEN 39000.00
        WHEN id = 'speaker' THEN 105000.00
        WHEN id = 'webcam' THEN 60000.00
        WHEN id = 'mic' THEN 54000.00
        WHEN id = 'stand' THEN 15000.00
        WHEN id = 'backpack' THEN 42000.00
        ELSE price * 300
    END,
    slashed_price = CASE 
        WHEN id = 'headphones' THEN 120000.00
        WHEN id = 'charger' THEN 36000.00
        WHEN id = 'keyboard' THEN 63000.00
        WHEN id = 'sleeve' THEN 18000.00
        WHEN id = 'lightbar' THEN 33000.00
        WHEN id = 'riser' THEN 27000.00
        WHEN id = 'mouse' THEN 54000.00
        WHEN id = 'speaker' THEN 138000.00
        WHEN id = 'webcam' THEN 81000.00
        WHEN id = 'mic' THEN 72000.00
        WHEN id = 'stand' THEN 21000.00
        WHEN id = 'backpack' THEN 57000.00
        ELSE slashed_price * 300
    END;
