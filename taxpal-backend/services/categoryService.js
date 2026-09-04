const CategoryModel = require("../models/categoryModel");

const CategoryService = {

    createCategory: async (user_id, categoryData) => {

        if (!user_id) {
            throw new Error("User ID is required");
        }

        const {
            name,
            type,
            color,
            description
        } = categoryData;

        if (!name || !name.trim()) {
            throw new Error("Category name is required");
        }

        if (!type) {
            throw new Error("Category type is required");
        }

        if (
            type !== "Income" &&
            type !== "Expense" &&
            type !== "income" &&
            type !== "expense"
        ) {
            throw new Error(
                "Category type must be Income or Expense"
            );
        }

        const normalizedType = type.toLowerCase();

        const category =
            await CategoryModel.createCategory({
                user_id: user_id,
                name: name.trim(),
                type: normalizedType,
                color: color || "#3b82f6",
                description: description || ""
            });

        return category;
    },

    getCategories: async (user_id) => {

        if (!user_id) {
            throw new Error("User ID is required");
        }

        const categories =
            await CategoryModel.getCategoriesByUser(
                user_id
            );

        return categories;
    },

    getCategoryById: async (id, user_id) => {

        if (!user_id) {
            throw new Error("User ID is required");
        }

        if (!id) {
            throw new Error("Category ID is required");
        }

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

    updateCategory: async (
        id,
        user_id,
        categoryData
    ) => {

        if (!user_id) {
            throw new Error("User ID is required");
        }

        if (!id) {
            throw new Error("Category ID is required");
        }

        const {
            name,
            type,
            color,
            description
        } = categoryData;

        if (!name || !name.trim()) {
            throw new Error("Category name is required");
        }

        if (!type) {
            throw new Error("Category type is required");
        }

        if (
            type !== "Income" &&
            type !== "Expense" &&
            type !== "income" &&
            type !== "expense"
        ) {
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

        const normalizedType =
            type.toLowerCase();

        const result =
            await CategoryModel.updateCategory(
                id,
                user_id,
                {
                    name: name.trim(),
                    type: normalizedType,
                    color: color || "#3b82f6",
                    description: description || ""
                }
            );

        return result;
    },

    deleteCategory: async (
        id,
        user_id
    ) => {

        if (!user_id) {
            throw new Error("User ID is required");
        }

        if (!id) {
            throw new Error("Category ID is required");
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
            await CategoryModel.deleteCategory(
                id,
                user_id
            );

        return result;
    }

};

module.exports = CategoryService;