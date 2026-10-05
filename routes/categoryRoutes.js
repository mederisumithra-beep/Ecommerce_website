const express = require("express");

const router = express.Router();

const categoryController = require("../controllers/categoryControllers");

router.get("/test", (req, res) => {
    res.json({
        message: "Category route is working"
    });
});

router.post("/create", categoryController.createCategory);

router.get("/list", categoryController.getCategories);

router.get("/:id/products", categoryController.getProductsByCategory);

router.get("/:id", categoryController.getCategoryById);

router.put("/:id", categoryController.updateCategory);

router.delete("/:id", categoryController.deleteCategory);

module.exports = router;