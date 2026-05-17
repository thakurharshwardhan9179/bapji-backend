const Credit = require("../models/Credit");

exports.addCredit = async (req, res) => {
  try {
    const credit = await Credit.create({
      owner: req.user._id,
      customerName: req.body.customerName,
      mobile: req.body.mobile,
      amount: req.body.amount,
      note: req.body.note,
      status: req.body.status || "Pending",
    });

    res.status(201).json(credit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCredits = async (req, res) => {
  try {
    const credits = await Credit.find({
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(credits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleCreditStatus = async (req, res) => {
  try {
    const credit = await Credit.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!credit) {
      return res.status(404).json({ message: "Credit not found" });
    }

    credit.status = credit.status === "Pending" ? "Paid" : "Pending";
    await credit.save();

    res.json(credit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCredit = async (req, res) => {
  try {
    await Credit.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    res.json({ message: "Credit deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};