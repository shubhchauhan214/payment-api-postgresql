const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./userModel"); // Import User model

const Payment = sequelize.define("Payment", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: "id"
        }
    },
    orderId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: "INR"
    },
    status: {
        type: DataTypes.ENUM("Pending", "Success", "Failed"),
        defaultValue: "Pending"
    },
    transactionId: {
        type: DataTypes.STRING,
        unique: true
    },
    razorpayOrderId: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { timestamps: true });

// Establishing relationship: A user can have multiple payments
User.hasMany(Payment, { foreignKey: "userId" });
Payment.belongsTo(User, { foreignKey: "userId" });

module.exports = Payment;
