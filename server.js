const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// CORS Setup
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sensational-licorice-e2fd88.netlify.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Preflight request handle
app.options("*", cors());

// JSON body parser
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Dukan Maintenance API running...");
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/sales", require("./routes/saleRoutes"));
app.use("/api/credits", require("./routes/creditRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/otp", require("./routes/otpRoutes"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});