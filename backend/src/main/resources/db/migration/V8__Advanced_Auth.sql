-- Thêm các cột mới vào bảng users
ALTER TABLE users ADD COLUMN lockout_time DATETIME DEFAULT NULL;
ALTER TABLE users ADD COLUMN last_login_at DATETIME DEFAULT NULL;
ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE;

-- Cập nhật các user cũ thành đã verify (nếu có dữ liệu)
UPDATE users SET is_email_verified = TRUE WHERE email IS NOT NULL;

-- Bảng Refresh Tokens
CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng Verification Tokens
CREATE TABLE verification_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expiry_date DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng Invalidated Tokens (Blacklist)
CREATE TABLE invalidated_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(500) NOT NULL,
    expiry_date DATETIME NOT NULL
);
