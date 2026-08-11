const CategoryService = require("../services/categoryService");

// ==========================================
// Create Category
// ==========================================
const createCategory = async (req, res) => {

    try {

        const user_id = req.user.id;

        const category =
            await CategoryService.createCategory(
                user_id,
                req.body
            );

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });

    } catch (error) {

        console.error(
            "Create Category Error:",
            error.message
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================================
// Get All Categories
// ==========================================
const getCategories = async (req, res) => {

    try {

        const user_id = req.user.id;

        const categories =
            await CategoryService.getCategories(
                user_id
            );

        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: categories
        });

    } catch (error) {

        console.error(
            "Get Categories Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
            error: error.message
        });
    }
};


// ==========================================
// Get Single Category
// ==========================================
const getCategoryById = async (req, res) => {

    try {

        const user_id = req.user.id;
        const { id } = req.params;

        const category =
            await CategoryService.getCategoryById(
                id,
                user_id
            );

        return res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            data: category
        });

    } catch (error) {

        console.error(
            "Get Category Error:",
            error.message
        );

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================================
// Update Category
// ==========================================
const updateCategory = async (req, res) => {

    try {

        const user_id = req.user.id;
        const { id } = req.params;

        await CategoryService.updateCategory(
            id,
            user_id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Category updated successfully"
        });

    } catch (error) {

        console.error(
            "Update Category Error:",
            error.message
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// ==========================================
// Delete Category
// ==========================================
const deleteCategory = async (req, res) => {

    try {

        const user_id = req.user.id;
        const { id } = req.params;

        await CategoryService.deleteCategory(
            id,
            user_id
        );

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete Category Error:",
            error.message
        );

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};