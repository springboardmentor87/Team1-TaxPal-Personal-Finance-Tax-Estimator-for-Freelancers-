const { z } = require('zod');

const createAlertSchema = z.object({
  body: z.object({
    type: z.string({ required_error: 'Alert type is required' }).trim().min(1),
    title: z.string().optional().default('Alert Notification'),
    message: z.string({ required_error: 'Alert message is required' }).trim().min(1),
    severity: z.string().optional().default('info'),
    actionUrl: z.string().optional(),
    isRead: z.boolean().optional().default(false),
  }),
});

const alertIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

module.exports = {
  createAlertSchema,
  alertIdParamSchema,
};
