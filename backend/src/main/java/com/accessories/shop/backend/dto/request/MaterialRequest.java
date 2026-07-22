package com.accessories.shop.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MaterialRequest {
    private String name;
    private String slug;
    private String careInstructions;
}
