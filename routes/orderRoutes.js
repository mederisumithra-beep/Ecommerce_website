const express = require("express");

const router = express.Router();

const orderController = require("../controllers/orderControllers");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

router.post(
    "/create",
    protect,
    orderController.createOrder
);

router.get(
    "/user/:userId",
    protect,
    orderController.getUserOrders
);

router.get(
    "/admin",
    protect,
    admin,
    orderController.getAllOrders
);

router.get(
    "/admin/:id",
    protect,
    admin,
    orderController.getAdminOrderById
);

router.put(
    "/admin/:id/status",
    protect,
    admin,
    orderController.updateAdminOrderStatus
);

router.get(
    "/:id",
    protect,
    orderController.getOrderById
);

router.put(
    "/:id/status",
    protect,
    orderController.updateOrderStatus
);

router.put(
    "/:id/cancel",
    protect,
    orderController.cancelOrder
);

router.delete(
    "/:id",
    protect,
    orderController.deleteOrder
);

module.exports = router;