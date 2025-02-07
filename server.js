const express = require("express");
const dotenv = require("dotenv");
const paymentRoutes = require("./routes/paymentRoutes");
const sequelize = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

dotenv.config();
const app = express();

app.use(express.json());
app.use("/api/payments", paymentRoutes);

// Error Handling Middleware (must be at the end)
app.use(errorHandler);

// Sync PostgreSQL Database
sequelize
    .sync({ alter: true })
    .then(() => console.log("✅ PostgreSQL Database Synced"))
    .catch((err) => console.error("❌ PostgreSQL Sync Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
