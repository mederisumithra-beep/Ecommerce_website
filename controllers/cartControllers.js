const Cart = require("../models/cart");
const User = require("../models/user");
const Product = require("../models/products");

const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        if (!userId || !productId || quantity === undefined) {
            return res.status(400).json({
                message: "userId, productId and quantity are required"
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be greater than 0"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (product.isActive === false) {
            return res.status(400).json({
                message: "Product is inactive"
            });
        }

        if (quantity > product.quantity) {
            return res.status(400).json({
                message: "Insufficient stock"
            });
        }

        const existingCart = await Cart.findOne({
            userId,
            productId
        });

        if (existingCart) {
            const newQuantity = existingCart.quantity + quantity;

            if (newQuantity > product.quantity) {
                return res.status(400).json({
                    message: "Insufficient stock for requested quantity"
                });
            }

            existingCart.quantity = newQuantity;
            existingCart.price = product.price;

            await existingCart.save();

            return res.status(200).json({
                message: "Product quantity updated in cart",
                cart: existingCart
            });
        }

        const cartItem = new Cart({
            userId,
            productId,
            quantity,
            price: product.price
        });

        await cartItem.save();

        res.status(201).json({
            message: "Product added to cart successfully",
            cart: cartItem
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const getUserCart = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const cartItems = await Cart.find({ userId })
            .populate("productId");

        let grandTotal = 0;

        const items = cartItems.map((item) => {
            const itemTotal = item.quantity * item.price;

            grandTotal += itemTotal;

            return {
                cartId: item._id,
                product: item.productId,
                quantity: item.quantity,
                price: item.price,
                itemTotal: itemTotal
            };
        });

        res.status(200).json({
            userId,
            items,
            grandTotal
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const updateCart = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined) {
            return res.status(400).json({
                message: "Quantity is required"
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be greater than 0"
            });
        }

        const cartItem = await Cart.findById(id);

        if (!cartItem) {
            return res.status(404).json({
                message: "Cart item not found"
            });
        }

        const product = await Product.findById(cartItem.productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (quantity > product.quantity) {
            return res.status(400).json({
                message: "Insufficient stock"
            });
        }

        cartItem.quantity = quantity;
        cartItem.price = product.price;

        await cartItem.save();

        res.status(200).json({
            message: "Cart quantity updated successfully",
            cart: cartItem
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const removeCartItem = async (req, res) => {
    try {
        const { id } = req.params;

        const cartItem = await Cart.findById(id);

        if (!cartItem) {
            return res.status(404).json({
                message: "Cart item not found"
            });
        }

        await Cart.findByIdAndDelete(id);

        res.status(200).json({
            message: "Cart item removed successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const clearCart = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const result = await Cart.deleteMany({ userId });

        res.status(200).json({
            message: "Cart cleared successfully",
            deletedItems: result.deletedCount
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    addToCart,
    getUserCart,
    updateCart,
    removeCartItem,
    clearCart
};