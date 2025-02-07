const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false
});

sequelize.authenticate()
    .then(() => console.log("✅ Connected to PostgreSQL"))
    .catch(err => console.error("❌ Error connecting to PostgreSQL:", err));

module.exports = sequelize;
