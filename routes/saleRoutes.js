const express = require("express");
const {
  addSale,
  getSales,
  deleteSale,
} = require("../controllers/saleController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addSale);
router.get("/", protect, getSales);
router.delete("/:id",  protect,deleteSale);

module.exports = router;