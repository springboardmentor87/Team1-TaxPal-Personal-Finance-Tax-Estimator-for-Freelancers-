const express = require('express');
const { CategoryController } = require('../controllers/category.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', CategoryController.getCategories);
router.get('/type/:type', CategoryController.getCategoriesByType);
router.post('/', CategoryController.createCategory);
router.put('/:categoryId', CategoryController.updateCategory);
router.delete('/:categoryId', CategoryController.deleteCategory);
router.post('/initialize-default', CategoryController.initializeDefaultCategories);

module.exports = router;
