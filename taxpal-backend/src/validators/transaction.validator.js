const { z } = require('zod');

const createTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['income', 'expense', 'Income', 'Expense'], {
      required_error: 'Type is required',
    }),
    description: z.string({ required_error: 'Description is required' }).trim().min(1),
    category: z.string({ required_error: 'Category is required' }).trim().min(1),
    customCategory: z.string().optional(),
    amount: z.coerce.number({ required_error: 'Amount is required' }).min(0),
    transactionDate: z.string().optional(),
    notes: z.string().trim().optional(),
    receiptUrl: z.string().optional(),
    isDeductible: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    isRecurring: z.boolean().optional(),
  }),
});

const updateTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['income', 'expense', 'Income', 'Expense']).optional(),
    description: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    customCategory: z.string().optional(),
    amount: z.coerce.number().min(0).optional(),
    transactionDate: z.string().optional(),
    notes: z.string().trim().optional(),
    receiptUrl: z.string().optional(),
    isDeductible: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    isRecurring: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

const transactionIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdParamSchema,
};
