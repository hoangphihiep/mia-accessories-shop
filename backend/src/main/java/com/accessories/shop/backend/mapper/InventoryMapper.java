package com.accessories.shop.backend.mapper;

import com.accessories.shop.backend.dto.response.InventoryReceiptDetailResponse;
import com.accessories.shop.backend.dto.response.InventoryReceiptResponse;
import com.accessories.shop.backend.entity.InventoryReceipt;
import com.accessories.shop.backend.entity.InventoryReceiptDetail;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class, ProductMapper.class, SupplierMapper.class})
public interface InventoryMapper {
    InventoryReceiptResponse toResponse(InventoryReceipt receipt);
    InventoryReceiptDetailResponse toDetailResponse(InventoryReceiptDetail detail);
}
