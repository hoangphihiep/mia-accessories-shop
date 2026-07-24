package com.accessories.shop.backend.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CollectionResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String coverImage;
    private String bannerImage;
    private Boolean isActive;
    // We will return product summaries instead of full products to avoid deep nesting
    private List<ProductResponse> products;
}
