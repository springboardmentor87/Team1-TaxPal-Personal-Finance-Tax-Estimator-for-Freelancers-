const express = require('express');
const { TransactionController } = require('../controllers/transaction.controller');
const { validate } = require('../middleware/validation.middleware');
const { createTransactionSchema, updateTransactionSchema, transactionIdParamSchema } = require('../validators/transaction.validator');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createTransactionSchema), TransactionController.createTransaction);
router.get('/', TransactionController.getTransactions);
router.get('/:id', validate(transactionIdParamSchema), TransactionController.getTransactionById);
router.put('/:id', validate(updateTransactionSchema), TransactionController.updateTransaction);
router.delete('/:id', validate(transactionIdParamSchema), TransactionController.deleteTransaction);

module.exports = router;
