package com.accessories.shop.backend.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MaterialResponse {
    private Long id;
    private String name;
    private String slug;
    private String careInstructions;
}
