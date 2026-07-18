-- Xóa dữ liệu cũ (nếu muốn làm sạch database trước khi test, cẩn thận nếu đã có dữ liệu quan trọng)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE product_images;
-- TRUNCATE TABLE product_variants;
-- TRUNCATE TABLE products;
-- TRUNCATE TABLE categories;
-- TRUNCATE TABLE materials;
-- TRUNCATE TABLE roles;
-- SET FOREIGN_KEY_CHECKS = 1;

-- 1. Thêm Roles (RẤT QUAN TRỌNG ĐỂ PHÂN QUYỀN)
INSERT INTO roles (name) VALUES 
('ROLE_CUSTOMER'),
('ROLE_STAFF'),
('ROLE_ADMIN');

-- 2. Thêm Danh mục (Categories) theo chủ đề / phong cách
INSERT INTO categories (name, slug, status) VALUES 
('Tâm linh', 'tam-linh', true),
('Phong thủy', 'phong-thuy', true),
('Tình yêu', 'tinh-yeu', true),
('Tối giản (Minimalist)', 'toi-gian', true);

-- 3. Thêm Chất liệu (Materials)
INSERT INTO materials (name, description) VALUES 
('Bạc 925', 'Bạc ta tiêu chuẩn cao cấp'),
('Titan không gỉ', 'Titan siêu bền, không đen không gỉ'),
('Hợp kim cao cấp', 'Hợp kim mạ vàng 18k');

-- 4. Thêm Sản phẩm (Products)
-- product: name, slug, description, is_active, category_id, material_id, created_at, updated_at
INSERT INTO products (name, slug, description, is_active, category_id, material_id, created_at, updated_at) VALUES 
('Nhẫn Bát Nhã Tâm Kinh', 'nhan-bat-nha-tam-kinh', 'Thiết kế mang ý nghĩa bình an, tịnh tâm.', true, 1, 1, NOW(), NOW()),
('Dây chuyền Hồ Ly Phong Thủy', 'day-chuyen-ho-ly', 'Đá phong thủy mang lại may mắn trong tình duyên và công việc.', true, 2, 2, NOW(), NOW()),
('Vòng tay Cỏ Bốn Lá', 'vong-tay-co-bon-la', 'Biểu tượng của sự may mắn và tình yêu chung thủy.', true, 3, 3, NOW(), NOW());

-- 5. Thêm Biến thể sản phẩm (Product Variants)
-- Mẫu A, Mẫu B, Mẫu C như bạn yêu cầu (cột name trong DB sẽ lưu giá trị này)
-- product_variants: product_id, name, sku, price, stock_quantity, is_active
INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, is_active) VALUES 
-- Biến thể cho Nhẫn (Product ID: 1)
(1, 'Mẫu A (Đá trắng)', 'NHAN-A', 350000, 100, true),
(1, 'Mẫu B (Đá hồng)', 'NHAN-B', 380000, 50, true),
(1, 'Mẫu C (Đá xanh)', 'NHAN-C', 380000, 20, true),

-- Biến thể cho Dây chuyền (Product ID: 2)
(2, 'Mẫu A (Xích nhỏ)', 'DAY-A', 450000, 200, true),
(2, 'Mẫu B (Xích to)', 'DAY-B', 480000, 120, true),

-- Biến thể cho Khuyên tai (Product ID: 3)
(3, 'Mẫu A (Ngọc trai 6 ly)', 'KHUYEN-A', 250000, 80, true),
(3, 'Mẫu B (Ngọc trai 8 ly)', 'KHUYEN-B', 280000, 60, true);

-- 6. Thêm Ảnh sản phẩm (Product Images)
INSERT INTO product_images (product_id, image_url, is_primary) VALUES 
(1, 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80', true),
(1, 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?auto=format&fit=crop&q=80', false),
(2, 'https://images.unsplash.com/photo-1599643478514-4a820c5678ee?auto=format&fit=crop&q=80', true),
(3, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80', true);

-- ==========================================
-- HƯỚNG DẪN TẠO TÀI KHOẢN ADMIN / STAFF:
-- ==========================================
-- Do mật khẩu trong Spring Security đã được mã hóa (băm) rất phức tạp bằng thuật toán BCrypt.
-- Thay vì copy mã băm vào SQL có thể gây lỗi không đăng nhập được, bạn hãy làm theo cách sau:
-- 1. Chạy Spring Boot và Frontend.
-- 2. Lên giao diện Web, vào trang Đăng ký (Register).
-- 3. Đăng ký 2 tài khoản, ví dụ: 'admin@gmail.com' và 'staff@gmail.com' (với pass 123456).
-- 4. Quay lại MySQL, chạy lệnh UPDATE này để cấp quyền cho họ (Đổi email tương ứng):

-- UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'ROLE_ADMIN') WHERE email = 'admin@gmail.com';
-- UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'ROLE_STAFF') WHERE email = 'staff@gmail.com';
