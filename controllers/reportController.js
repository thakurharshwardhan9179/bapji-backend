const Sale = require("../models/Sale");
const Expense = require("../models/Expense");
const Credit = require("../models/Credit");

function getDateRange(type, startDate, endDate) {
  let start;
  let end;

  if (startDate && endDate) {
    start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  const now = new Date();
  start = new Date();

  if (type === "daily") {
    start.setHours(0, 0, 0, 0);
  }

  if (type === "weekly") {
    const day = now.getDay();
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
  }

  if (type === "monthly") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

exports.getReport = async (req, res) => {
  try {
    const type = req.query.type || "daily";
    const { startDate, endDate } = req.query;

    const { start, end } = getDateRange(type, startDate, endDate);

    const sales = await Sale.find({
      owner: req.user._id,
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 });

    const expenses = await Expense.find({
      owner: req.user._id,
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 });

    const credits = await Credit.find({
      owner: req.user._id,
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 });

    const chaiSales = sales.filter((s) => s.itemCategory === "Chai");
    const otherSales = sales.filter((s) => s.itemCategory !== "Chai");

    const chaiSale = chaiSales.reduce(
      (sum, s) => sum + Number(s.totalAmount || 0),
      0
    );

    const otherSale = otherSales.reduce(
      (sum, s) => sum + Number(s.totalAmount || 0),
      0
    );

    const chaiKharcha = expenses
      .filter((e) => e.category === "Chai Kharcha")
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const shopKharcha = expenses
      .filter((e) => e.category !== "Chai Kharcha")
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const otherProfit = otherSales.reduce(
      (sum, s) => sum + Number(s.profit || 0),
      0
    );

    const chaiProfit = chaiSale - chaiKharcha;

    const totalSale = chaiSale + otherSale;
    const totalExpense = chaiKharcha + shopKharcha;

    const cashSale = sales
      .filter((s) => s.paymentMode === "Cash")
      .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

    const upiSale = sales
      .filter((s) => s.paymentMode === "UPI")
      .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

    const udharSale = sales
      .filter((s) => s.paymentMode === "Udhar")
      .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

    const pendingUdhar = credits
      .filter((c) => c.status === "Pending")
      .reduce((sum, c) => sum + Number(c.amount || 0), 0);

    const itemWise = {};

    sales.forEach((sale) => {
      if (!itemWise[sale.itemName]) {
        itemWise[sale.itemName] = {
          itemName: sale.itemName,
          category: sale.itemCategory || "Other",
          quantity: 0,
          totalAmount: 0,
          profit: 0,
        };
      }

      itemWise[sale.itemName].quantity += Number(sale.quantity || 0);
      itemWise[sale.itemName].totalAmount += Number(sale.totalAmount || 0);
      itemWise[sale.itemName].profit += Number(sale.profit || 0);
    });

    res.json({
      type,
      start,
      end,
      chaiSale,
      chaiKharcha,
      chaiProfit,
      otherSale,
      otherProfit,
      shopKharcha,
      totalSale,
      totalExpense,
      netProfit: chaiProfit + otherProfit - shopKharcha,
      cashSale,
      upiSale,
      udharSale,
      pendingUdhar,
      totalSalesCount: sales.length,
      itemWise: Object.values(itemWise),
      sales,
      expenses,
      credits,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};