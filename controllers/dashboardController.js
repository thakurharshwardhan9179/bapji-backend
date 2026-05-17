const Item = require("../models/Item");
const Sale = require("../models/Sale");
const Credit = require("../models/Credit");
const Expense = require("../models/Expense");

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

exports.getDashboard = async (req, res) => {
  try {
    const { start, end } = todayRange();

    const items = await Item.find({
      owner: req.user._id,
    });

    const sales = await Sale.find({
      owner: req.user._id,
      createdAt: { $gte: start, $lte: end },
    });

    const expenses = await Expense.find({
      owner: req.user._id,
      createdAt: { $gte: start, $lte: end },
    });

    const credits = await Credit.find({
      owner: req.user._id,
      status: "Pending",
    });

    const chaiSales = sales.filter((s) => s.itemCategory === "Chai");
    const otherSales = sales.filter((s) => s.itemCategory !== "Chai");

    const chaiSale = chaiSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
    const otherSale = otherSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
    const totalSale = chaiSale + otherSale;

    const chaiKharcha = expenses
      .filter((e) => e.category === "Chai Kharcha")
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const shopKharcha = expenses
      .filter((e) => e.category !== "Chai Kharcha")
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const otherProfit = otherSales.reduce((sum, s) => sum + Number(s.profit || 0), 0);
    const chaiProfit = chaiSale - chaiKharcha;

    const cashSale = sales
      .filter((s) => s.paymentMode === "Cash")
      .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

    const upiSale = sales
      .filter((s) => s.paymentMode === "UPI")
      .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

    const udharSale = sales
      .filter((s) => s.paymentMode === "Udhar")
      .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

    const pendingUdhar = credits.reduce(
      (sum, c) => sum + Number(c.amount || 0),
      0
    );

    const stockBuyingValue = items.reduce(
      (sum, item) =>
        sum + Number(item.packets || 0) * Number(item.purchasePrice || 0),
      0
    );

    const stockSaleValue = items.reduce(
      (sum, item) =>
        item.category === "Chai"
          ? sum
          : sum + Number(item.stock || 0) * Number(item.salePrice || 0),
      0
    );

    const lowStockItems = items.filter(
      (item) =>
        item.category !== "Chai" &&
        Number(item.stock || 0) <= Number(item.piecesPerPacket || 1)
    );

    const topItems = sales
      .reduce((acc, sale) => {
        const found = acc.find((i) => i.itemName === sale.itemName);

        if (found) {
          found.quantity += Number(sale.quantity || 0);
        } else {
          acc.push({
            itemName: sale.itemName,
            quantity: Number(sale.quantity || 0),
          });
        }

        return acc;
      }, [])
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.json({
      chaiSale,
      chaiKharcha,
      chaiProfit,
      otherSale,
      otherProfit,
      totalSale,
      totalExpense: chaiKharcha + shopKharcha,
      shopKharcha,
      netProfit: chaiProfit + otherProfit - shopKharcha,
      cashSale,
      upiSale,
      udharSale,
      pendingUdhar,
      stockBuyingValue,
      stockSaleValue,
      totalItems: items.length,
      lowStockItems,
      topItems,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};