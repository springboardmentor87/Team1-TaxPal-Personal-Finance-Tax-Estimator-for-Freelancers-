const { z } = require('zod');

const createReportSchema = z.object({
  body: z.object({
    reportType: z.string().trim().optional(),
    type: z.string().trim().optional(),
    title: z.string().trim().optional(),
    period: z.string().trim().optional().default('Current Month'),
    format: z.string().optional().default('PDF'),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
  }).passthrough(),
});

const reportIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }).passthrough(),
});

const scheduleReportSchema = z.object({
  body: z.object({
    frequency: z.string({ required_error: 'Frequency is required' }).trim().min(1).optional(),
    email: z.string({ required_error: 'Email is required' }).email(),
    format: z.string().optional().default('PDF'),
    reportType: z.string().optional(),
  }).passthrough(),
});

module.exports = {
  createReportSchema,
  reportIdParamSchema,
  scheduleReportSchema,
};
