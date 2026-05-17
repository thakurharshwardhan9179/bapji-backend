const Expense = require("../models/Expense");

exports.addExpense = async (req, res) => {
  try {
    const expense = await Expense.create({
      owner: req.user._id,
      title: req.body.title,
      amount: req.body.amount,
      category: req.body.category,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};