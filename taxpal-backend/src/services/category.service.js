const Category = require('../models/Category');
const { ApiError } = require('../utils/ApiError');

class CategoryService {
  static async getCategories(userId) {
    return await Category.findForUser(userId);
  }

  static async getCategoriesByType(userId, type) {
    return await Category.findByType(userId, type);
  }

  static async createCategory(userId, categoryData) {
    return await Category.create({
      userId,
      ...categoryData,
    });
  }

  static async updateCategory(categoryId, userId, categoryData) {
    const updated = await Category.updateById(categoryId, userId, categoryData);
    if (!updated) {
      throw new ApiError(404, 'Category not found or cannot be modified');
    }
    return updated;
  }

  static async deleteCategory(categoryId, userId) {
    const deleted = await Category.deleteById(categoryId, userId);
    if (!deleted) {
      throw new ApiError(404, 'Category not found or is a default system category');
    }
  }
}

module.exports = {
  CategoryService,
};
