const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["Chai", "Cigarette", "Biscuit", "Namkeen", "Cold Drink", "Other"],
      default: "Other",
    },

    salePrice: {
      type: Number,
      required: true,
      default: 0,
    },

    purchasePrice: {
      type: Number,
      default: 0,
    },

    piecesPerPacket: {
      type: Number,
      default: 1,
    },

    packets: {
      type: Number,
      default: 0,
    },

    stock: {
      type: Number,
      default: 0,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);