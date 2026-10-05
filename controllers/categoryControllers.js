const mongoose = require("mongoose");

const Category = require("../models/category");
const Product = require("../models/products");


const createCategory = async (req, res) => {
    try {
        const { name, description, status } = req.body;

        // Validate name
        if (!name) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        // Validate status
        if (status !== "active" && status !== "inactive") {
            return res.status(400).json({
                message: "Status must be active or inactive"
            });
        }

        // Check duplicate category
        const existingCategory = await Category.findOne({ name });

        if (existingCategory) {
            return res.status(400).json({
                message: "Category already exists"
            });
        }

        // Create category
        const category = new Category({
            name,
            description,
            status
        });

        await category.save();

        res.status(201).json({
            message: "Category created successfully",
            category
        });

    } catch (error) {
        res.status(500).json({
            message: "Error creating category",
            error: error.message
        });
    }
};

const getCategories = async (req, res) => {
    try {

        const { status } = req.query;

        let filter = {};

       
        if (status) {

            if (status !== "active" && status !== "inactive") {
                return res.status(400).json({
                    message: "Status must be active or inactive"
                });
            }

            filter.status = status;
        }

        const categories = await Category.find(filter);

        res.status(200).json({
            message: "Categories fetched successfully",
            count: categories.length,
            categories
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching categories",
            error: error.message
        });
    }
};


const getCategoryById = async (req, res) => {
    try {

        const { id } = req.params;

        // Check valid MongoDB ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        res.status(200).json({
            message: "Category fetched successfully",
            category
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching category",
            error: error.message
        });
    }
};

const updateCategory = async (req, res) => {
    try {

        const { id } = req.params;
        const { name, description, status } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

     
        if (
            status !== undefined &&
            status !== "active" &&
            status !== "inactive"
        ) {
            return res.status(400).json({
                message: "Status must be active or inactive"
            });
        }

        
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

       
        if (name && name !== category.name) {

            const existingCategory = await Category.findOne({
                name,
                _id: { $ne: id }
            });

            if (existingCategory) {
                return res.status(400).json({
                    message: "Category already exists"
                });
            }
        }

    
        if (name !== undefined) {
            category.name = name;
        }

        if (description !== undefined) {
            category.description = description;
        }

        if (status !== undefined) {
            category.status = status;
        }

        await category.save();

        res.status(200).json({
            message: "Category updated successfully",
            category
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating category",
            error: error.message
        });
    }
};



const deleteCategory = async (req, res) => {
    try {

        const { id } = req.params;

        
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        await Category.findByIdAndDelete(id);

        res.status(200).json({
            message: "Category deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Error deleting category",
            error: error.message
        });
    }
};

const getProductsByCategory = async (req, res) => {
    try {

        const { id } = req.params;

     
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid category ID"
            });
        }

       
        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

    
        const products = await Product.find({
            categoryId: id
        });

        res.status(200).json({
            message: "Products fetched successfully",
            category: category.name,
            count: products.length,
            products
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching products by category",
            error: error.message
        });
    }
};


module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getProductsByCategory
};