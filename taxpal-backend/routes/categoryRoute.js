const express = require("express");

const router = express.Router();

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const authMiddleware = require("../middleware/authMiddleware");


// ==========================================
// Create Category
// POST /api/category
// ==========================================
router.post(
    "/",
    authMiddleware,
    createCategory
);


// ==========================================
// Get All Categories
// GET /api/category
// ==========================================
router.get(
    "/",
    authMiddleware,
    getCategories
);


// ==========================================
// Get Single Category
// GET /api/category/:id
// ==========================================
router.get(
    "/:id",
    authMiddleware,
    getCategoryById
);


// ==========================================
// Update Category
// PUT /api/category/:id
// ==========================================
router.put(
    "/:id",
    authMiddleware,
    updateCategory
);


// ==========================================
// Delete Category
// DELETE /api/category/:id
// ==========================================
router.delete(
    "/:id",
    authMiddleware,
    deleteCategory
);


module.exports = router;