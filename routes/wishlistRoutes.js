const express = require("express");

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist
} = require("../controllers/wishlistController");

const router = express.Router();

router.post("/add", addToWishlist);

router.get("/:userId", getWishlist);

router.delete("/:userId/:productId", removeFromWishlist);

module.exports = router;