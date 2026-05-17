const express = require("express");

const {
  addItem,
  getItems,
  updateItem,
  addStock,
  deleteItem,
} = require("../controllers/itemController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/",protect, addItem);
router.get("/",protect, getItems);
router.put("/:id",protect, updateItem);
router.put("/:id/add-stock",protect,addStock);
router.delete("/:id",protect, deleteItem);

module.exports = router;