package com.accessories.shop.backend.service;

import com.accessories.shop.backend.entity.Category;
import com.accessories.shop.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    // Lấy tất cả thể loại
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // Lấy chi tiết 1 thể loại theo ID
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thể loại với ID: " + id));
    }

    // Thêm mới thể loại
    public Category createCategory(Category category) {
        // Tự động tạo slug đơn giản nếu chưa có (Sau này nâng cấp lên hàm chuẩn sau)
        if (category.getSlug() == null || category.getSlug().isEmpty()) {
            category.setSlug(category.getName().toLowerCase().replaceAll(" ", "-"));
        }
        return categoryRepository.save(category);
    }

    // Cập nhật thể loại
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = getCategoryById(id);
        category.setName(categoryDetails.getName());
        category.setSlug(categoryDetails.getSlug());
        category.setStatus(categoryDetails.getStatus());
        if (categoryDetails.getParentCategory() != null) {
            category.setParentCategory(categoryDetails.getParentCategory());
        }
        return categoryRepository.save(category);
    }

    // Xóa thể loại
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }
}