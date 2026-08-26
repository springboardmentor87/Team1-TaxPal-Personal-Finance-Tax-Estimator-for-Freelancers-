const { CategoryService } = require('../services/category.service');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');

class CategoryController {
  static async getCategories(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const categories = await CategoryService.getCategories(userId);
      res.status(200).json(new ApiResponse(categories, 'Categories retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getCategoriesByType(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const { type } = req.params;
      const categories = await CategoryService.getCategoriesByType(userId, type);
      res.status(200).json(new ApiResponse(categories, 'Categories retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const { name, type, color, icon } = req.body;
      if (!name || !type) {
        throw new ApiError(400, 'Name and type are required');
      }

      const category = await CategoryService.createCategory(userId, { name, type, color, icon });
      res.status(201).json(new ApiResponse(category, 'Category created successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const { categoryId } = req.params;
      const category = await CategoryService.updateCategory(categoryId, userId, req.body);
      res.status(200).json(new ApiResponse(category, 'Category updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const { categoryId } = req.params;
      await CategoryService.deleteCategory(categoryId, userId);
      res.status(200).json(new ApiResponse(null, 'Category deleted successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async initializeDefaultCategories(req, res, next) {
    try {
      res.status(200).json(new ApiResponse(null, 'Default categories ready'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  CategoryController,
};
