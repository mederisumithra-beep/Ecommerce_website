const Order = require("../models/order");
const Cart = require("../models/cart");
const User = require("../models/user");
const Product = require("../models/products");

const createOrder = async (req, res) => {
    try {
        const { shippingAddress } = req.body;

        const userId = req.user.id;

        if (!shippingAddress) {
            return res.status(400).json({
                message: "shippingAddress is required"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const cartItems = await Cart.find({ userId });

        if (cartItems.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        const orderItems = [];
        let totalAmount = 0;

        for (const cartItem of cartItems) {
            const product = await Product.findById(cartItem.productId);

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            if (product.status !== "active") {
                return res.status(400).json({
                    message: `Product ${product.name} is inactive`
                });
            }

            if (cartItem.quantity > product.stock) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}`
                });
            }

            const itemTotal = cartItem.quantity * product.price;
            console.log("ORDER PRODUCT IMAGE:", product.imageUrl);
            orderItems.push({
                productId: product._id,
                name: product.name,
                imageUrl: product.imageUrl,
                quantity: cartItem.quantity,
                price: product.price,
                total: itemTotal
            });

            totalAmount += itemTotal;
        }

        const order = new Order({
            userId,
            items: orderItems,
            totalAmount,
            status: "pending",
            shippingAddress
        });

        await order.save();

        for (const cartItem of cartItems) {
            const product = await Product.findById(cartItem.productId);

            product.stock -= cartItem.quantity;

            await product.save();
        }

        await Cart.deleteMany({ userId });

        res.status(201).json({
            message: "Order created successfully",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.user.id !== userId) {
            return res.status(403).json({
                message: "You are not allowed to view these orders"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            userId,
            orders
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.userId.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not allowed to view this order"
            });
        }

        res.status(200).json(order);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (!status) {
            return res.status(400).json({
                message: "Status is required"
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (
            order.userId.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "You are not allowed to update this order"
            });
        }

        if (order.status === "cancelled") {
            return res.status(400).json({
                message: "Cancelled order status cannot be changed"
            });
        }

        order.status = status;

        await order.save();

        res.status(200).json({
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (
            order.userId.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "You are not allowed to cancel this order"
            });
        }

        if (
            order.status !== "pending" &&
            order.status !== "confirmed"
        ) {
            return res.status(400).json({
                message: "Only pending or confirmed orders can be cancelled"
            });
        }

        for (const item of order.items) {
            const product = await Product.findById(item.productId);

            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        order.status = "cancelled";

        await order.save();

        res.status(200).json({
            message: "Order cancelled successfully",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (
            order.userId.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                message: "You are not allowed to delete this order"
            });
        }

        await Order.findByIdAndDelete(id);

        res.status(200).json({
            message: "Order deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            orders
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const getAdminOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json(order);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const updateAdminOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (!status) {
            return res.status(400).json({
                message: "Status is required"
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.status === "cancelled") {
            return res.status(400).json({
                message: "Cancelled order status cannot be changed"
            });
        }

        order.status = status;

        await order.save();

        res.status(200).json({
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    getAllOrders,
    getAdminOrderById,
    updateAdminOrderStatus
};