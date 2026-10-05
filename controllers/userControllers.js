const User = require("../models/user");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        status: false,
        message: "Email already registered"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    return res.status(201).json({
      status: true,
      message: "Registration Successful",
      data: {
        id: newUser._id
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User does not exist"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid password"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    return res.status(200).json({
      status: true,
      message: "Login successful",
      data: {
        id: user._id,
        role: user.role,
        token: token
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({
        status: false,
        message: "Role must be user or admin"
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    user.role = role;

    await user.save();

    return res.status(200).json({
      status: true,
      message: "User role updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUserRole
};