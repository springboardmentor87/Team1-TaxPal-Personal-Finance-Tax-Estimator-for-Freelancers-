const express = require('express');
const { BudgetController } = require('../controllers/budget.controller');
const { validate } = require('../middleware/validation.middleware');
const { setBudgetSchema } = require('../validators/budget.validator');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', BudgetController.getBudgets);
router.post('/', validate(setBudgetSchema), BudgetController.setBudget);
router.delete('/:category', BudgetController.deleteBudget);

module.exports = router;
