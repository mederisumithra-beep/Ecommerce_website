const Address = require("../models/address");

const addAddress = async (req, res) => {
  try {
    const {
      userId,
      name,
      phone,
      address,
      city,
      state,
      pincode
    } = req.body;

    if (
      !userId ||
      !name ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        status: false,
        message: "All address details are required"
      });
    }

    const newAddress = new Address({
      userId,
      name,
      phone,
      address,
      city,
      state,
      pincode
    });

    await newAddress.save();

    return res.status(201).json({
      status: true,
      message: "Address added successfully",
      data: newAddress
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};


const getAddresses = async (req, res) => {
  try {
    const { userId } = req.params;

    const addresses = await Address.find({
      userId: userId
    }).sort({
      createdAt: -1
    });

    return res.status(200).json({
      status: true,
      data: addresses
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};


const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findById(id);

    if (!address) {
      return res.status(404).json({
        status: false,
        message: "Address not found"
      });
    }

    await Address.findByIdAndDelete(id);

    return res.status(200).json({
      status: true,
      message: "Address deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};


module.exports = {
  addAddress,
  getAddresses,
  deleteAddress
};