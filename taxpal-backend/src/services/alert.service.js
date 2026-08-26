const Alert = require('../models/Alert');
const { ApiError } = require('../utils/ApiError');

class AlertService {
  static async createAlert(userId, data) {
    return await Alert.create({
      userId,
      type: data.type,
      title: data.title || 'Notification',
      message: data.message,
      severity: data.severity || 'info',
      actionUrl: data.actionUrl || '',
      isRead: data.isRead || false,
    });
  }

  static async createTaxReminderAlert(userId, quarter, dueDate) {
    const formattedDate = new Date(dueDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });

    const message = `Your ${quarter} advance tax payment is due on ${formattedDate}.`;

    return await Alert.create({
      userId,
      type: 'Quarterly Tax Reminder',
      title: 'Tax Due Reminder',
      message,
      severity: 'warning',
      actionUrl: '/tax-estimator',
      isRead: false,
    });
  }

  static async getAlerts(userId) {
    return await Alert.findByUserId(userId);
  }

  static async getAlertById(userId, alertId) {
    const alert = await Alert.findById(alertId, userId);
    if (!alert) {
      throw new ApiError(404, 'Alert not found');
    }
    return alert;
  }

  static async markAsRead(userId, alertId) {
    const alert = await Alert.markAsRead(alertId, userId);
    if (!alert) {
      throw new ApiError(404, 'Alert not found');
    }
    return alert;
  }

  static async markAllAsRead(userId) {
    await Alert.markAllAsRead(userId);
  }

  static async deleteAlert(userId, alertId) {
    const deleted = await Alert.deleteById(alertId, userId);
    if (!deleted) {
      throw new ApiError(404, 'Alert not found');
    }
  }
}

module.exports = {
  AlertService,
};
