import { User } from "../models/user.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, userProfile } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ err: "Fill all inputs" });
  }

  const userExist = await User.findOne({ email });

  if (userExist) {
    return res
      .status(404)
      .json({ success: false, err: "Email already in use" });
  }

  const hashed = await bcrypt.hash(password, 20);

  const user = await User.create({
    username,
    email,
    password: hashed,
    userProfile,
  });

  const token = jwt.sign(
    {
      userId: user._id,
      username: user.username,
      userProfile: user.userProfile,
    },
    process.env.TOKEN,
    {
      expiresIn: "30d",
    }
  );


  return res.status(201).json({
    success: true,
    user: {
      username: user.username,
      email: user.email,
      token,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, username, userProfile } = req.body;

  if (!email || !password) {
    res.status(400).json({ err: "Fill all inputs" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(404)
      .json({ success: false, err: "Invalid credentials Email" });
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res
      .status(404)
      .json({ success: false, err: "Invalid credentials Password" });
  }

  const token = jwt.sign(
    {
      userId: user._id,
      username: user.username,
      userProfile: user.userProfile,
    },
    process.env.TOKEN,
    {
      expiresIn: "30d",
    }
  );



  return res.status(200).json({
    success: true,
    user: {
      username: user.username,
      email: user.email,
      userProfile: user.userProfile,
      token,
    },
  });
});
