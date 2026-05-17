const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

exports.register = async (req, res) => {
  try {
    const { shopName, ownerName, mobile, password, ownerSecret } = req.body;

    if (ownerSecret !== process.env.OWNER_SECRET) {
      return res.status(403).json({
        message: "Invalid owner secret code",
      });
    }

    if (!shopName || !ownerName || !mobile || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const userExists = await User.findOne({ mobile });

    if (userExists) {
      return res.status(400).json({ message: "Mobile already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      shopName,
      ownerName,
      mobile,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      shopName: user.shopName,
      ownerName: user.ownerName,
      mobile: user.mobile,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ message: "Mobile and password required" });
    }

    const user = await User.findOne({ mobile });

    if (!user) {
      return res.status(400).json({ message: "Invalid mobile or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid mobile or password" });
    }

    res.json({
      _id: user._id,
      shopName: user.shopName,
      ownerName: user.ownerName,
      mobile: user.mobile,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};