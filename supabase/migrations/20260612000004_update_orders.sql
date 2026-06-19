-- Alter Orders Table to support Phone Number and Payment Method
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash_on_delivery';
