const express = require("express");

const router = express.Router();

const cartController = require("../controllers/cartControllers");

console.log("Cart routes loaded");

router.get("/test", (req, res) => {
    res.json({
        message: "Cart route is working"
    });
});

router.post("/add", cartController.addToCart);

router.get("/:userId", cartController.getUserCart);

router.put("/:id", cartController.updateCart);

router.delete("/:id", cartController.removeCartItem);

router.delete("/user/:userId", cartController.clearCart);

module.exports = router;