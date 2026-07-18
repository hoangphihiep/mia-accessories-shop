package com.accessories.shop.backend.repository;

import com.accessories.shop.backend.entity.InventoryReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryReceiptRepository extends JpaRepository<InventoryReceipt, Long> {
}
