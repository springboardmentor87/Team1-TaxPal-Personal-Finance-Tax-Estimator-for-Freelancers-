const { AlertService } = require('../services/alert.service');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');

class AlertController {
  static async createAlert(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const alert = await AlertService.createAlert(userId, req.body);
      res.status(201).json(new ApiResponse(alert, 'Alert created successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getAlerts(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const alerts = await AlertService.getAlerts(userId);
      res.status(200).json(new ApiResponse(alerts, 'Alerts retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async getAlertById(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      const { id } = req.params;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const alert = await AlertService.getAlertById(userId, id);
      res.status(200).json(new ApiResponse(alert, 'Alert retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      const { id } = req.params;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      const alert = await AlertService.markAsRead(userId, id);
      res.status(200).json(new ApiResponse(alert, 'Alert marked as read successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      await AlertService.markAllAsRead(userId);
      res.status(200).json(new ApiResponse(null, 'All alerts marked as read'));
    } catch (error) {
      next(error);
    }
  }

  static async deleteAlert(req, res, next) {
    try {
      const userId = req.user && req.user.id;
      const { id } = req.params;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized: User context missing');
      }

      await AlertService.deleteAlert(userId, id);
      res.status(200).json(new ApiResponse(null, 'Alert deleted successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = {
  AlertController,
};
