const express = require("express");
const {
  addCredit,
  getCredits,
  toggleCreditStatus,
  deleteCredit,
} = require("../controllers/creditController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/",protect, addCredit);
router.get("/",protect, getCredits);
router.put("/:id/toggle", protect,toggleCreditStatus);
router.delete("/:id",protect, deleteCredit);

module.exports = router;