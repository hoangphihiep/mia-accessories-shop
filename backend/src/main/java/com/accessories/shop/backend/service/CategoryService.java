package com.accessories.shop.backend.service;

import com.accessories.shop.backend.dto.request.CategoryRequest;
import com.accessories.shop.backend.entity.Category;
import com.accessories.shop.backend.repository.CategoryRepository;
import com.accessories.shop.backend.exception.BadRequestException;
import com.accessories.shop.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thể loại với ID: " + id));
    }

    @Transactional
    public Category createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setStatus(request.getStatus() != null ? request.getStatus() : true);
        
        String slug = (request.getSlug() == null || request.getSlug().trim().isEmpty()) 
                        ? generateSlug(request.getName()) 
                        : generateSlug(request.getSlug());
        
        if (categoryRepository.findBySlug(slug).isPresent()) {
            throw new BadRequestException("Đường dẫn (slug) đã tồn tại: " + slug);
        }
        category.setSlug(slug);

        if (request.getParentId() != null) {
            Category parent = getCategoryById(request.getParentId());
            category.setParentCategory(parent);
        }
        
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, CategoryRequest request) {
        Category category = getCategoryById(id);
        
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            category.setStatus(request.getStatus());
        }

        String newSlug = (request.getSlug() == null || request.getSlug().trim().isEmpty()) 
                        ? generateSlug(request.getName()) 
                        : generateSlug(request.getSlug());
        
        if (!category.getSlug().equals(newSlug) && categoryRepository.findBySlug(newSlug).isPresent()) {
            throw new BadRequestException("Đường dẫn (slug) đã tồn tại: " + newSlug);
        }
        category.setSlug(newSlug);

        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new BadRequestException("Danh mục không thể làm cha của chính nó!");
            }
            Category parent = getCategoryById(request.getParentId());
            
            // Check for circular reference (A -> B -> A)
            Category currentParent = parent;
            while(currentParent != null) {
                if (currentParent.getId().equals(id)) {
                    throw new BadRequestException("Lỗi vòng lặp danh mục: Danh mục cha không thể là danh mục con của danh mục hiện tại.");
                }
                currentParent = currentParent.getParentCategory();
            }
            
            category.setParentCategory(parent);
        } else {
            category.setParentCategory(null);
        }

        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        
        if (category.getProducts() != null && !category.getProducts().isEmpty()) {
            throw new BadRequestException("Không thể xóa danh mục đang có sản phẩm! Hãy chuyển sản phẩm sang danh mục khác trước.");
        }
        
        // Cần kiểm tra xem có danh mục con nào đang tham chiếu tới nó không
        List<Category> allCategories = categoryRepository.findAll();
        boolean hasChildren = allCategories.stream()
            .anyMatch(c -> c.getParentCategory() != null && c.getParentCategory().getId().equals(id));
            
        if (hasChildren) {
             throw new BadRequestException("Không thể xóa danh mục đang có danh mục con!");
        }

        categoryRepository.delete(category);
    }
    
    private String generateSlug(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(normalized).replaceAll("");
        slug = slug.toLowerCase();
        slug = slug.replaceAll("đ", "d");
        slug = slug.replaceAll("[^a-z0-9\\s-]", "");
        slug = slug.replaceAll("\\s+", "-");
        slug = slug.replaceAll("-+", "-");
        return slug;
    }
}