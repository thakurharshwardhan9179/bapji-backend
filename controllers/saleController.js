const Sale = require("../models/Sale");
const Item = require("../models/Item");
const Credit = require("../models/Credit");

exports.addSale = async (req, res) => {
  try {
    const {
      itemId,
      quantity,
      paymentMode,
      customerName,
      mobile,
      note,
    } = req.body;

    const item = await Item.findOne({
      _id: itemId,
      owner: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (
      item.category !== "Chai" &&
      item.stock < quantity
    ) {
      return res.status(400).json({
        message: "Not enough stock",
      });
    }

    const totalAmount =
      item.salePrice * quantity;

    const costPerPiece =
      item.purchasePrice /
      item.piecesPerPacket;

    const profit =
      (item.salePrice - costPerPiece) *
      quantity;

    const sale = await Sale.create({
      owner: req.user._id,

      itemId: item._id,
      itemName: item.name,
      itemCategory:
        item.category || "Other",
      price: item.salePrice,
      quantity,
      totalAmount,
      paymentMode,
      profit,
    });

    // stock kam karo
    if (item.category !== "Chai") {
      item.stock =
        item.stock - quantity;

      item.packets =
        item.stock /
        item.piecesPerPacket;

      await item.save();
    }

    // udhar
    if (paymentMode === "Udhar") {
      await Credit.create({
        owner: req.user._id,

        customerName:
          customerName || "Unknown",

        mobile: mobile || "",

        amount: totalAmount,

        note:
          note ||
          `${item.name} × ${quantity}`,

        status: "Pending",
      });
    }

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.getSales = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      owner: req.user._id,

      createdAt: {
        $gte: start,
        $lte: end,
      },
    }).sort({ createdAt: -1 });

    res.json(sales);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!sale) {
      return res.status(404).json({
        message: "Sale not found",
      });
    }

    const item = await Item.findOne({
      _id: sale.itemId,
      owner: req.user._id,
    });

    if (item && item.category !== "Chai") {
      item.stock =
        item.stock + sale.quantity;

      item.packets =
        item.stock /
        item.piecesPerPacket;

      await item.save();
    }

    await Sale.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    res.json({
      message:
        "Sale deleted and stock restored",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};