const { z } = require('zod');

const setBudgetSchema = z.object({
  body: z.object({
    category: z.string({ required_error: 'Category is required' }).trim().min(1),
    limit: z.coerce.number({ required_error: 'Limit is required' }).min(0),
    month: z.string({ required_error: 'Month is required' }).regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
    description: z.string().trim().optional().default(''),
  }),
});

module.exports = {
  setBudgetSchema,
};
