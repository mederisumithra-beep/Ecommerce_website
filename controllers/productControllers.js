const Product = require("../models/products");
const Category = require("../models/category");

const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            stock,
            status,
            categoryId,
            imageUrl
        } = req.body;

        console.log("IMAGE URL:", imageUrl);

        if (!name || price === undefined || stock === undefined) {
            return res.status(400).json({
                message: "name,price and stock are required"
            });
        }

        if (!categoryId) {
            return res.status(400).json({
                message: "Category ID is required"
            });
        }

        if (price <= 0) {
            return res.status(400).json({
                message: "price must be greater than 0"
            });
        }

        if (stock < 0) {
            return res.status(400).json({
                message: "stock cannot be negative"
            });
        }

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({
                message: "status should be active or inactive"
            });
        }

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({
                message: "Invalid category"
            });
        }

        if (category.status !== "active") {
            return res.status(400).json({
                message: "Product cannot be assigned to an inactive category"
            });
        }

        const product = new Product({
            name,
            description,
            price,
            stock,
            status,
            categoryId,
            imageUrl
        });

        await product.save();

        res.status(201).json({
            message: "product created successfully",
            product
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate("categoryId", "name");

        res.status(200).json(products);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("categoryId", "name");

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            stock,
            status,
            categoryId,
            imageUrl
        } = req.body;

        if (price !== undefined && price <= 0) {
            return res.status(400).json({
                message: "Price must be greater than 0"
            });
        }

        if (stock !== undefined && stock < 0) {
            return res.status(400).json({
                message: "Stock cannot be negative"
            });
        }

        if (
            status !== undefined &&
            !["active", "inactive"].includes(status)
        ) {
            return res.status(400).json({
                message: "Status should be active or inactive"
            });
        }

        if (categoryId !== undefined) {
            const category = await Category.findById(categoryId);

            if (!category) {
                return res.status(404).json({
                    message: "Invalid category"
                });
            }

            if (category.status !== "active") {
                return res.status(400).json({
                    message: "Product cannot be assigned to an inactive category"
                });
            }
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                price,
                stock,
                status,
                categoryId,
                imageUrl
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product updated successfully",
            product
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully",
            product
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};