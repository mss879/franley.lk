-- Add meta_title column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title TEXT;
