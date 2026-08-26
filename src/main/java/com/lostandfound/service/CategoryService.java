package com.lostandfound.service;

import com.lostandfound.dto.CategoryResponse;
import com.lostandfound.model.Category;
import com.lostandfound.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName()))
                .collect(Collectors.toList());
    }

    public CategoryResponse createCategory(String name) {
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Category already exists: " + name);
        }
        Category category = categoryRepository.save(Category.builder().name(name).build());
        return new CategoryResponse(category.getId(), category.getName());
    }
}
