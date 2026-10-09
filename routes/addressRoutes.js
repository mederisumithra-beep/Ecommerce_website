const express = require("express");

const {
  addAddress,
  getAddresses,
  deleteAddress
} = require("../controllers/addressControllers");

const router = express.Router();

router.post("/add", addAddress);

router.get("/:userId", getAddresses);

router.delete("/:id", deleteAddress);

module.exports = router;