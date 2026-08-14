const express = require("express");

const router = express.Router();

const {

    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory

} = require("../controllers/categoryController");

const authMiddleware =
    require("../middleware/authMiddleware");


// Create Category
// POST /api/categories

router.post(
    "/",
    authMiddleware,
    createCategory
);


// Get All Categories
// GET /api/categories

router.get(
    "/",
    authMiddleware,
    getCategories
);


// Get Single Category
// GET /api/categories/:id

router.get(
    "/:id",
    authMiddleware,
    getCategoryById
);


// Update Category
// PUT /api/categories/:id

router.put(
    "/:id",
    authMiddleware,
    updateCategory
);


// Delete Category
// DELETE /api/categories/:id

router.delete(
    "/:id",
    authMiddleware,
    deleteCategory
);


module.exports = router;