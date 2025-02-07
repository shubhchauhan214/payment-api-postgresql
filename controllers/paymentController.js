const Razorpay = require("razorpay");
const Payment = require("../models/paymentModel");
const User = require("../models/userModel");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// 📌 Create a Payment
exports.createPayment = async (req, res, next) => {
    try {
        const { amount, currency, userId } = req.body;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: "User not found." });

        const options = {
            amount: amount * 100, // Convert to paisa
            currency: currency || "INR",
            receipt: uuidv4(),
            payment_capture: 1
        };

        const order = await razorpayInstance.orders.create(options);

        const payment = await Payment.create({
            userId,
            orderId: order.receipt,
            amount,
            currency: order.currency,
            razorpayOrderId: order.id
        });

        res.status(201).json({ success: true, order, payment });
    } catch (error) {
        next(error);
    }
};

// 📌 Verify Payment
exports.verifyPayment = async (req, res, next) => {
    try {
        const { paymentId, orderId, signature } = req.body;

        // Verification logic goes here...

        await Payment.update({ status: "Success", transactionId: paymentId }, { where: { razorpayOrderId: orderId } });

        res.status(200).json({ success: true, message: "Payment verified." });
    } catch (error) {
        next(error);
    }
};

// 📌 Refund Payment
exports.refundPayment = async (req, res, next) => {
    try {
        const { paymentId } = req.body;

        // Refund logic using Razorpay API...

        await Payment.update({ status: "Refunded" }, { where: { transactionId: paymentId } });

        res.status(200).json({ success: true, message: "Payment refunded." });
    } catch (error) {
        next(error);
    }
};

// 📌 Get Payment Status
exports.getPaymentStatus = async (req, res, next) => {
    try {
        const payment = await Payment.findByPk(req.params.paymentId);
        if (!payment) return res.status(404).json({ error: "Payment not found." });

        res.status(200).json({ success: true, status: payment.status });
    } catch (error) {
        next(error);
    }
};

// 📌 Get User Transactions
exports.getUserTransactions = async (req, res, next) => {
    try {
        const transactions = await Payment.findAll({ where: { userId: req.params.userId } });
        res.status(200).json({ success: true, transactions });
    } catch (error) {
        next(error);
    }
};

// 📌 Withdraw Funds
exports.withdrawFunds = async (req, res, next) => {
    try {
        const { userId, amount } = req.body;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ error: "User not found." });

        if (user.walletBalance < amount) return res.status(400).json({ error: "Insufficient funds." });

        await user.update({ walletBalance: user.walletBalance - amount });

        res.status(200).json({ success: true, message: "Funds withdrawn successfully." });
    } catch (error) {
        next(error);
    }
};

// 📌 Transfer Funds
exports.transferFunds = async (req, res, next) => {
    try {
        const { senderId, receiverId, amount } = req.body;

        const sender = await User.findByPk(senderId);
        const receiver = await User.findByPk(receiverId);

        if (!sender || !receiver) return res.status(404).json({ error: "Invalid users." });

        if (sender.walletBalance < amount) return res.status(400).json({ error: "Insufficient funds." });

        await sender.update({ walletBalance: sender.walletBalance - amount });
        await receiver.update({ walletBalance: receiver.walletBalance + amount });

        res.status(200).json({ success: true, message: "Funds transferred successfully." });
    } catch (error) {
        next(error);
    }
};

// 📌 Get User Balance
exports.getUserBalance = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.userId);
        if (!user) return res.status(404).json({ error: "User not found." });

        res.status(200).json({ success: true, balance: user.walletBalance });
    } catch (error) {
        next(error);
    }
};
