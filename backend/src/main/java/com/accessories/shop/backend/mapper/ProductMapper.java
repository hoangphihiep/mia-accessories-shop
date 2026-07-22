package com.accessories.shop.backend.mapper;

import com.accessories.shop.backend.dto.request.ProductRequest;
import com.accessories.shop.backend.dto.response.ProductImageResponse;
import com.accessories.shop.backend.dto.response.ProductResponse;
import com.accessories.shop.backend.dto.response.ProductVariantResponse;
import com.accessories.shop.backend.entity.Product;
import com.accessories.shop.backend.entity.ProductImage;
import com.accessories.shop.backend.entity.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class, MaterialMapper.class})
public interface ProductMapper {

    ProductResponse toResponse(Product product);
    
    @Mapping(source = "product.name", target = "productName")
    ProductVariantResponse toVariantResponse(ProductVariant variant);
    
    ProductImageResponse toImageResponse(ProductImage image);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "material", ignore = true)
    @Mapping(target = "variants", ignore = true)
    @Mapping(target = "images", ignore = true)
    Product toEntity(ProductRequest request);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "material", ignore = true)
    @Mapping(target = "variants", ignore = true)
    @Mapping(target = "images", ignore = true)
    void updateEntityFromRequest(ProductRequest request, @MappingTarget Product product);
}
