const CategoryModel = require("../models/categoryModel");

const CategoryService = {

    // ==========================================
    // Create Category
    // ==========================================
    createCategory: async (user_id, categoryData) => {

        const {
            name,
            type
        } = categoryData;

        if (!name || !name.trim()) {
            throw new Error("Category name is required");
        }

        if (!type) {
            throw new Error("Category type is required");
        }

        if (type !== "Income" && type !== "Expense") {
            throw new Error(
                "Category type must be Income or Expense"
            );
        }

        const category = await CategoryModel.createCategory({
            user_id,
            name: name.trim(),
            type
        });

        return category;
    },


    // ==========================================
    // Get All Categories
    // ==========================================
    getCategories: async (user_id) => {

        return await CategoryModel.getCategoriesByUser(
            user_id
        );
    },


    // ==========================================
    // Get Single Category
    // ==========================================
    getCategoryById: async (id, user_id) => {

        const category =
            await CategoryModel.getCategoryById(
                id,
                user_id
            );

        if (!category) {
            throw new Error("Category not found");
        }

        return category;
    },


    // ==========================================
    // Update Category
    // ==========================================
    updateCategory: async (
        id,
        user_id,
        categoryData
    ) => {

        const {
            name,
            type
        } = categoryData;

        if (!name || !name.trim()) {
            throw new Error("Category name is required");
        }

        if (!type) {
            throw new Error("Category type is required");
        }

        if (type !== "Income" && type !== "Expense") {
            throw new Error(
                "Category type must be Income or Expense"
            );
        }

        const existingCategory =
            await CategoryModel.getCategoryById(
                id,
                user_id
            );

        if (!existingCategory) {
            throw new Error("Category not found");
        }

        const result =
            await CategoryModel.updateCategory(
                id,
                user_id,
                {
                    name: name.trim(),
                    type
                }
            );

        return result;
    },


    // ==========================================
    // Delete Category
    // ==========================================
    deleteCategory: async (id, user_id) => {

        const existingCategory =
            await CategoryModel.getCategoryById(
                id,
                user_id
            );

        if (!existingCategory) {
            throw new Error("Category not found");
        }

        const result =
            await CategoryModel.deleteCategory(
                id,
                user_id
            );

        return result;
    }

};

module.exports = CategoryService;