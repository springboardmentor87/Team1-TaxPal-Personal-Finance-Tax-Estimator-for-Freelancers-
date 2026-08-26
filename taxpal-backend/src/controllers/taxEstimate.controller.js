const { TaxEstimateService } = require('../services/taxEstimate.service');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');

class TaxEstimateController {
  static async createTaxEstimate(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const estimate = await TaxEstimateService.createTaxEstimate(userId, req.body);
      res.status(201).json(new ApiResponse(estimate, 'Tax estimate created successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getTaxEstimates(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const estimates = await TaxEstimateService.getTaxEstimates(userId);
      res.status(200).json(new ApiResponse(estimates, 'Tax estimates retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getTaxEstimateById(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      const { id } = req.params;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const estimate = await TaxEstimateService.getTaxEstimateById(userId, id);
      res.status(200).json(new ApiResponse(estimate, 'Tax estimate retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async updateTaxEstimate(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      const { id } = req.params;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const estimate = await TaxEstimateService.updateTaxEstimate(userId, id, req.body);
      res.status(200).json(new ApiResponse(estimate, 'Tax estimate updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async deleteTaxEstimate(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      const { id } = req.params;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      await TaxEstimateService.deleteTaxEstimate(userId, id);
      res.status(200).json(new ApiResponse(null, 'Tax estimate deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  TaxEstimateController,
};
