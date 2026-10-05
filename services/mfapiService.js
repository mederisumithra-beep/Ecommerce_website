const axios = require("axios");

const MFAPI_BASE_URL = "https://api.mfapi.in";

const searchMutualFunds = async (keyword) => {
    const response = await axios.get(
        `${MFAPI_BASE_URL}/mf/search`,
        {
            params: {
                q: keyword
            }
        }
    );

    return response.data;
};

const getMutualFundDetails = async (schemeCode) => {
    const response = await axios.get(
        `${MFAPI_BASE_URL}/mf/${schemeCode}`
    );

    return response.data;
};

const getLatestNAV = async (schemeCode) => {
    const response = await axios.get(
        `${MFAPI_BASE_URL}/mf/${schemeCode}/latest`
    );

    return response.data;
};

const getNAVHistory = async (schemeCode) => {
    const response = await axios.get(
        `${MFAPI_BASE_URL}/mf/${schemeCode}`
    );

    return response.data;
};

module.exports = {
    searchMutualFunds,
    getMutualFundDetails,
    getLatestNAV,
    getNAVHistory
};