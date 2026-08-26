const { z } = require('zod');

const createTaxEstimateSchema = z.object({
  body: z.object({
    country: z.string({ required_error: 'Country is required' }).trim().min(1),
    state: z.string().trim().optional(),
    quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']).optional(),
    year: z.coerce.number().int().optional(),
    grossIncomeForQuarter: z.coerce.number().min(0),
    businessExpenses: z.coerce.number().min(0).optional().default(0),
    retirementContribution: z.coerce.number().min(0).optional().default(0),
    healthInsurancePremiums: z.coerce.number().min(0).optional().default(0),
    homeOfficeDeduction: z.coerce.number().min(0).optional().default(0),
    filingStatus: z.string().optional(),
  }),
});

const taxEstimateIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

module.exports = {
  createTaxEstimateSchema,
  taxEstimateIdParamSchema,
  updateTaxEstimateSchema: createTaxEstimateSchema,
  getTaxEstimateByIdSchema: taxEstimateIdParamSchema,
};
