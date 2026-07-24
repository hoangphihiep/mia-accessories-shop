package com.accessories.shop.backend.specification;

import com.accessories.shop.backend.entity.Product;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {

    public static Specification<Product> hasSearchKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return null;
            }
            // Mở rộng search trên nhiều trường (name, slug)
            String likePattern = "%" + keyword.toLowerCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), likePattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("slug")), likePattern)
            );
        };
    }

    public static Specification<Product> hasCategory(String categoryName) {
        return (root, query, criteriaBuilder) -> {
            if (categoryName == null || categoryName.trim().isEmpty() || categoryName.equalsIgnoreCase("All")) {
                return null;
            }
            return criteriaBuilder.equal(root.join("category", JoinType.LEFT).get("name"), categoryName);
        };
    }

    public static Specification<Product> hasPriceBetween(Double minPrice, Double maxPrice) {
        return (root, query, criteriaBuilder) -> {
            if (minPrice == null && maxPrice == null) {
                return null;
            }
            // Product -> ProductVariant (Join)
            var variantJoin = root.join("variants", JoinType.LEFT);
            if (minPrice != null && maxPrice != null) {
                return criteriaBuilder.between(variantJoin.get("price"), minPrice, maxPrice);
            } else if (minPrice != null) {
                return criteriaBuilder.greaterThanOrEqualTo(variantJoin.get("price"), minPrice);
            } else {
                return criteriaBuilder.lessThanOrEqualTo(variantJoin.get("price"), maxPrice);
            }
        };
    }

    public static Specification<Product> isActive() {
        return (root, query, criteriaBuilder) -> criteriaBuilder.isTrue(root.get("isActive"));
    }

    public static Specification<Product> hasIsFeatured(Boolean isFeatured) {
        return (root, query, criteriaBuilder) -> {
            if (isFeatured == null) {
                return null;
            }
            return criteriaBuilder.equal(root.get("isFeatured"), isFeatured);
        };
    }
}
