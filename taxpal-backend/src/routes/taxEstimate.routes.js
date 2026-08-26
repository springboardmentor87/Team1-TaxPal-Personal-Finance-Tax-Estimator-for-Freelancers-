const express = require('express');
const { TaxEstimateController } = require('../controllers/taxEstimate.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  createTaxEstimateSchema,
  taxEstimateIdParamSchema,
} = require('../validators/taxEstimate.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createTaxEstimateSchema), TaxEstimateController.createTaxEstimate);
router.get('/', TaxEstimateController.getTaxEstimates);
router.get('/:id', validate(taxEstimateIdParamSchema), TaxEstimateController.getTaxEstimateById);
router.put('/:id', validate(taxEstimateIdParamSchema), TaxEstimateController.updateTaxEstimate);
router.delete('/:id', validate(taxEstimateIdParamSchema), TaxEstimateController.deleteTaxEstimate);

module.exports = router;
