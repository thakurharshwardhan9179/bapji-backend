const Item = require("../models/Item");

exports.addItem = async (req, res) => {
  try {
    const {
      name,
      category,
      salePrice,
      purchasePrice,
      piecesPerPacket,
      packets,
    } = req.body;

    if (!name || !salePrice) {
      return res.status(400).json({
        message: "Item name aur sale price required hai",
      });
    }

    const finalCategory = category || "Other";

    let finalPiecesPerPacket = Number(piecesPerPacket) || 1;
    let finalPackets = Number(packets) || 0;
    let finalPurchasePrice = Number(purchasePrice) || 0;
    let totalStock = finalPackets * finalPiecesPerPacket;

    if (finalCategory === "Chai") {
      finalPurchasePrice = 0;
      finalPiecesPerPacket = 1;
      finalPackets = 0;
      totalStock = 999999;
    }

    const item = await Item.create({
      owner: req.user._id,

      name,
      category: finalCategory,
      salePrice: Number(salePrice),
      purchasePrice: finalPurchasePrice,
      piecesPerPacket: finalPiecesPerPacket,
      packets: finalPackets,
      stock: totalStock,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    const items = await Item.find({
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const {
      name,
      category,
      salePrice,
      purchasePrice,
      piecesPerPacket,
      packets,
    } = req.body;

    if (!name || !salePrice) {
      return res.status(400).json({
        message: "Item name aur sale price required hai",
      });
    }

    const finalCategory = category || "Other";

    let finalPiecesPerPacket = Number(piecesPerPacket) || 1;
    let finalPackets = Number(packets) || 0;
    let finalPurchasePrice = Number(purchasePrice) || 0;
    let totalStock = finalPackets * finalPiecesPerPacket;

    if (finalCategory === "Chai") {
      finalPurchasePrice = 0;
      finalPiecesPerPacket = 1;
      finalPackets = 0;
      totalStock = 999999;
    }

    const item = await Item.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user._id,
      },
      {
        name,
        category: finalCategory,
        salePrice: Number(salePrice),
        purchasePrice: finalPurchasePrice,
        piecesPerPacket: finalPiecesPerPacket,
        packets: finalPackets,
        stock: totalStock,
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addStock = async (req, res) => {
  try {
    const { packets } = req.body;

    const item = await Item.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (item.category === "Chai") {
      return res.status(400).json({
        message: "Chai me stock add karne ki zarurat nahi hai",
      });
    }

    const addPackets = Number(packets) || 0;

    item.packets =
      Number(item.packets || 0) + addPackets;

    item.stock =
      Number(item.stock || 0) +
      addPackets *
        Number(item.piecesPerPacket || 1);

    await item.save();

    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    await Item.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    res.json({
      message: "Item deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};