const express = require("express");

const router = express.Router();

const {
    getSpending
} = require("../controllers/spendingController");


const authMiddleware =
    require("../middleware/authMiddleware");


router.get(
    "/",
    authMiddleware,
    getSpending
);


module.exports = router;