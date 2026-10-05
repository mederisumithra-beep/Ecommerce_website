const MutualFund = require("../models/mutualFund");

const {
    searchMutualFunds,
    getMutualFundDetails,
    getLatestNAV,
    getNAVHistory
} = require("../services/mfapiService");

const searchFunds = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Search keyword is required"
            });
        }

        const data = await searchMutualFunds(q.trim());

        res.status(200).json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error("MFAPI Search Error:", error.message);

        res.status(502).json({
            success: false,
            message: "MFAPI is unavailable or returned an error"
        });
    }
};

const getSchemeDetails = async (req, res) => {
    try {
        const { schemeCode } = req.params;

        if (!schemeCode || !/^\d+$/.test(schemeCode)) {
            return res.status(400).json({
                success: false,
                message: "Valid scheme code is required"
            });
        }

        const data = await getMutualFundDetails(schemeCode);

        if (!data || !data.meta) {
            return res.status(404).json({
                success: false,
                message: "Mutual fund scheme not found"
            });
        }

        const meta = data.meta;

        const mutualFund = await MutualFund.findOneAndUpdate(
            {
                schemeCode: String(meta.scheme_code)
            },
            {
                schemeCode: String(meta.scheme_code),
                schemeName: meta.scheme_name,
                fundHouse: meta.fund_house,
                schemeType: meta.scheme_type,
                schemeCategory: meta.scheme_category,
                isinGrowth: meta.isin_growth,
                isinDivReinvestment: meta.isin_div_reinvestment
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: "Mutual fund details fetched and stored successfully",
            data: data,
            storedData: mutualFund
        });

    } catch (error) {
        console.error("Scheme Details Error:", error.message);

        res.status(502).json({
            success: false,
            message: "Unable to fetch mutual fund details"
        });
    }
};

const getLatestNav = async (req, res) => {
    try {
        const { schemeCode } = req.params;

        if (!schemeCode || !/^\d+$/.test(schemeCode)) {
            return res.status(400).json({
                success: false,
                message: "Valid scheme code is required"
            });
        }

        const data = await getLatestNAV(schemeCode);

        if (!data || !data.data || data.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Latest NAV not found"
            });
        }

        const latestData = data.data[0];

        const mutualFund = await MutualFund.findOneAndUpdate(
            {
                schemeCode: String(schemeCode)
            },
            {
                latestNav: Number(latestData.nav),
                latestNavDate: latestData.date
            },
            {
                new: true
            }
        );

        if (!mutualFund) {
            return res.status(404).json({
                success: false,
                message: "Scheme not found in MongoDB. Fetch scheme details first."
            });
        }

        res.status(200).json({
            success: true,
            message: "Latest NAV fetched and stored successfully",
            data: data,
            storedData: mutualFund
        });

    } catch (error) {
        console.error("Latest NAV Error:", error.message);

        res.status(502).json({
            success: false,
            message: "Unable to fetch latest NAV"
        });
    }
};

const getNavHistory = async (req, res) => {
    try {
        const { schemeCode } = req.params;

        if (!schemeCode || !/^\d+$/.test(schemeCode)) {
            return res.status(400).json({
                success: false,
                message: "Valid scheme code is required"
            });
        }

        const data = await getNAVHistory(schemeCode);

        res.status(200).json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error("NAV History Error:", error.message);

        res.status(502).json({
            success: false,
            message: "Unable to fetch NAV history"
        });
    }
};

const getStoredMutualFunds = async (req, res) => {
    try {
        const mutualFunds = await MutualFund.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: mutualFunds.length,
            data: mutualFunds
        });

    } catch (error) {
        console.error("MongoDB Error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to fetch mutual funds from MongoDB"
        });
    }
};

module.exports = {
    searchFunds,
    getSchemeDetails,
    getLatestNav,
    getNavHistory,
    getStoredMutualFunds
};