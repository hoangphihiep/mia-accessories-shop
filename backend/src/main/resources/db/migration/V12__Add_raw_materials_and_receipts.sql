CREATE TABLE raw_materials (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255),
    color VARCHAR(255),
    weight DECIMAL(10, 2),
    weight_unit VARCHAR(50),
    unit_price DECIMAL(15, 2),
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE raw_material_receipts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    supplier_id BIGINT,
    total_cost DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_raw_material_receipt_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_raw_material_receipt_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE TABLE raw_material_receipt_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    raw_material_receipt_id BIGINT NOT NULL,
    raw_material_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(15, 2),
    CONSTRAINT fk_rm_receipt_detail_receipt FOREIGN KEY (raw_material_receipt_id) REFERENCES raw_material_receipts(id),
    CONSTRAINT fk_rm_receipt_detail_material FOREIGN KEY (raw_material_id) REFERENCES raw_materials(id)
);
