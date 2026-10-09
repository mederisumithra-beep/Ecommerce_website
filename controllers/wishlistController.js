const Wishlist = require("../models/wishlistModel");

const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        products: [productId]
      });
    } else {
      if (wishlist.products.includes(productId)) {
        return res.status(400).json({
          message: "Product already in wishlist"
        });
      }

      wishlist.products.push(productId);
    }

    await wishlist.save();

    res.status(201).json({
      message: "Product added to wishlist",
      wishlist
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    const wishlist = await Wishlist.findOne({ userId })
      .populate("products");

    if (!wishlist) {
      return res.json({
        products: []
      });
    }

    res.json({
      products: wishlist.products
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({
        message: "Wishlist not found"
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    res.json({
      message: "Product removed from wishlist",
      wishlist
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist
};