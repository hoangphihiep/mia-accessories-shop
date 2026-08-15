-- =========================================================================
-- SCRIPT THÊM DỮ LIỆU MẪU: VẬT LIỆU (RAW MATERIALS)
-- Có thể chạy trực tiếp trong phpMyAdmin, DBeaver, DataGrip, MySQL Workbench...
-- =========================================================================

-- 1. Thêm danh mục (Category) "Vật Liệu" nếu chưa có
INSERT INTO categories (name, slug, description, is_active) 
SELECT 'Vật Liệu', 'vat-lieu', 'Các loại nguyên vật liệu thô dùng để gia công sản phẩm', true 
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'vat-lieu');

-- 2. Thêm chất liệu (Material) mẫu nếu chưa có
INSERT INTO materials (name, description, is_active) 
SELECT 'Nhựa Acrylic', 'Nhựa tổng hợp cao cấp, bền màu', true 
WHERE NOT EXISTS (SELECT 1 FROM materials WHERE name = 'Nhựa Acrylic');

INSERT INTO materials (name, description, is_active) 
SELECT 'Sợi sáp gai', 'Dây sáp gai tự nhiên, dai và bền', true 
WHERE NOT EXISTS (SELECT 1 FROM materials WHERE name = 'Sợi sáp gai');

INSERT INTO materials (name, description, is_active) 
SELECT 'Inox 304', 'Thép không gỉ 304, sáng bóng, không đen', true 
WHERE NOT EXISTS (SELECT 1 FROM materials WHERE name = 'Inox 304');

-- 3. Lưu lại các ID vừa tạo/tìm thấy để gán cho Product
SET @CatId = (SELECT id FROM categories WHERE slug = 'vat-lieu' LIMIT 1);
SET @MatId_Nhua = (SELECT id FROM materials WHERE name = 'Nhựa Acrylic' LIMIT 1);
SET @MatId_Day = (SELECT id FROM materials WHERE name = 'Sợi sáp gai' LIMIT 1);
SET @MatId_Inox = (SELECT id FROM materials WHERE name = 'Inox 304' LIMIT 1);

-- 4. Thêm Sản phẩm thô (Product)
INSERT INTO products (category_id, material_id, name, slug, description, technical_specifications, is_active, is_featured, is_new, production_type) 
VALUES 
(@CatId, @MatId_Nhua, 'Hạt cườm ngũ sắc 4mm (Túi 500g)', 'hat-cuom-ngu-sac-4mm', 'Hạt cườm nhựa tròn, đa sắc dùng để xâu vòng tay, vòng cổ handmade.', 'Kích thước: 4mm\nKhối lượng: 500g/túi\nMàu sắc: Đa sắc (Mix)\nĐộ bóng: Bóng sáng', true, false, true, 'IMPORTED'),
(@CatId, @MatId_Day, 'Dây sáp gai màu đen (Cuộn 100m)', 'day-sap-gai-mau-den', 'Sợi sáp gai dùng để thắt vòng macrame, rất dai và không thấm nước.', 'Đường kính dây: 1.5mm\nChiều dài: 100m/cuộn\nMàu sắc: Đen\nĐặc tính: Bọc sáp chống thấm nước', true, false, false, 'IMPORTED'),
(@CatId, @MatId_Inox, 'Móc khóa càng cua Inox (Bịch 100 cái)', 'moc-khoa-cang-cua-inox', 'Móc càng cua chốt khóa vòng tay, dây chuyền chất liệu Inox 304 không gỉ.', 'Kích thước: 12mm\nChất liệu: Inox 304 nguyên bản\nĐóng gói: 100 cái/bịch\nĐặc tính: Chống gỉ sét, an toàn cho da', true, true, false, 'IMPORTED');

-- 5. Lấy ID của Product vừa thêm
SET @ProdId_Hat = (SELECT id FROM products WHERE slug = 'hat-cuom-ngu-sac-4mm' LIMIT 1);
SET @ProdId_Day = (SELECT id FROM products WHERE slug = 'day-sap-gai-mau-den' LIMIT 1);
SET @ProdId_Moc = (SELECT id FROM products WHERE slug = 'moc-khoa-cang-cua-inox' LIMIT 1);

-- 6. Thêm các Mẫu mã (Product Variants) chứa số lượng và giá vốn
INSERT INTO product_variants (product_id, name, sku, price, compare_at_price, cost_price, stock_quantity, is_active) 
VALUES
(@ProdId_Hat, 'Hạt cườm đa sắc 4mm', 'RM-CUOM-001', 50000, 60000, 30000, 15.5, true),     -- 15.5 bịch (túi)
(@ProdId_Day, 'Dây sáp gai đen 1.5mm', 'RM-DAY-001', 35000, 0, 20000, 42.0, true),        -- 42.0 cuộn
(@ProdId_Moc, 'Móc càng cua Inox 12mm', 'RM-MOC-001', 40000, 0, 25000, 100.0, true);      -- 100 bịch
