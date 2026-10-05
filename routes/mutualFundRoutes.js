const express = require("express");

const router = express.Router();

const mutualFundController = require("../controllers/mutualFundControllers");

console.log("Mutual Fund routes loaded");

router.get("/search", mutualFundController.searchFunds);

router.get("/:schemeCode/latest", mutualFundController.getLatestNav);

router.get("/:schemeCode/nav-history", mutualFundController.getNavHistory);

router.get("/:schemeCode", mutualFundController.getSchemeDetails);

router.get("/", mutualFundController.getStoredMutualFunds);

module.exports = router;