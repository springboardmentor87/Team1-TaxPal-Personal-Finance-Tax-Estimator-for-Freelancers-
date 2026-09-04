const CategoryService = require("../services/categoryService");

const getUserId = (req) => {
    if (!req.user) {
        return null;
    }

    return (
        req.user.id ||
        req.user.user_id ||
        req.user.userId ||
        null
    );
};

const createCategory = async (req, res) => {
    try {
        const user_id = getUserId(req);

        console.log("Category Create - JWT User:", req.user);
        console.log("Category Create - User ID:", user_id);
        console.log("Category Create - Body:", req.body);

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in authentication token"
            });
        }

        const category = await CategoryService.createCategory(
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

const getCategories = async (req, res) => {
    try {
        const user_id = getUserId(req);

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in authentication token"
            });
        }

        const categories = await CategoryService.getCategories(
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

const getCategoryById = async (req, res) => {
    try {
        const user_id = getUserId(req);
        const { id } = req.params;

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in authentication token"
            });
        }

        const category = await CategoryService.getCategoryById(
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

const updateCategory = async (req, res) => {
    try {
        const user_id = getUserId(req);
        const { id } = req.params;

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in authentication token"
            });
        }

        const category = await CategoryService.updateCategory(
            id,
            user_id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category
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

const deleteCategory = async (req, res) => {
    try {
        const user_id = getUserId(req);
        const { id } = req.params;

        if (!user_id) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in authentication token"
            });
        }

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