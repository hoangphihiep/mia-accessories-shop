ALTER TABLE orders ADD COLUMN expected_completion_date DATE;
ALTER TABLE orders ADD COLUMN expected_delivery_date DATE;
ALTER TABLE orders ADD COLUMN tracking_code VARCHAR(255);
