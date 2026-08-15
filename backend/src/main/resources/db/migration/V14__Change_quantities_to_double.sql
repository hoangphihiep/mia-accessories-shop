-- Thay đổi kiểu dữ liệu của các cột số lượng từ INT sang DOUBLE để hỗ trợ số thập phân

ALTER TABLE product_variants MODIFY COLUMN stock_quantity DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE inventory_receipt_details MODIFY COLUMN quantity DOUBLE NOT NULL DEFAULT 0;
ALTER TABLE order_details MODIFY COLUMN quantity DOUBLE NOT NULL;
ALTER TABLE cart_items MODIFY COLUMN quantity DOUBLE NOT NULL;
