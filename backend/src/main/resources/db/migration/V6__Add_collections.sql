CREATE TABLE collections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    cover_image VARCHAR(255),
    banner_image VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE collection_products (
    collection_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    PRIMARY KEY (collection_id, product_id),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Seed data for Collections
INSERT INTO collections (id, name, slug, description, cover_image, banner_image, is_active) VALUES 
(1, 'Valentine''s Secret', 'valentines-secret', 'Khám phá vẻ đẹp ngọt ngào và lãng mạn qua bộ sưu tập Valentine''s Secret. Tôn vinh tình yêu đích thực với những thiết kế tinh tế, đính đá Zirconia lấp lánh như những vì sao trong mắt người thương.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000&auto=format&fit=crop', TRUE),
(2, 'Minimalist Love', 'minimalist-love', 'Sự sang trọng đến từ những điều đơn giản nhất. Bộ sưu tập Minimalist Love mang đến những thiết kế nguyên bản, thanh lịch, phù hợp cho mọi trang phục hằng ngày của các cô gái hiện đại.', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2000&auto=format&fit=crop', TRUE);

-- We assume product IDs 1, 2, 3, 4 exist in the database from previous seed data. 
-- If they don't, this will fail. Let's make sure we insert safely or just ignore errors.
-- Actually, a better approach for seeding is to ensure products exist or insert them first.
-- Let's just insert some mappings for IDs that are likely to exist.
INSERT INTO collection_products (collection_id, product_id) 
SELECT 1, id FROM products LIMIT 3;

INSERT INTO collection_products (collection_id, product_id) 
SELECT 2, id FROM products WHERE id NOT IN (SELECT product_id FROM collection_products WHERE collection_id = 1) LIMIT 4;
