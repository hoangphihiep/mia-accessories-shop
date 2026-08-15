ALTER TABLE product_variants ADD COLUMN display_quantity DOUBLE DEFAULT 0;
UPDATE product_variants SET display_quantity = stock_quantity WHERE display_quantity = 0;
