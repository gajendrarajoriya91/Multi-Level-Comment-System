const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { generateToken } = require("../utils/generateToken");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message:
          "A user with this email already exists. Please log in or use a different email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Registration successful.",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred during registration. Please try again later.",
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  //   console.log(email, password);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message:
          "Invalid email or password. Please check your credentials and try again.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message:
          "Invalid email or password. Please check your credentials and try again.",
      });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      message: "Login successful. Welcome back!",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred during login. Please try again later.",
    });
  }
};
