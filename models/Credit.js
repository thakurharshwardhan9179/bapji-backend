const mongoose = require("mongoose");

const creditSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Credit", creditSchema);