import { Post } from "../models/post.js";
import { v2 as cloudinary } from "cloudinary";
import asyncHandler from "express-async-handler";
import fs from "fs";
import { User } from "../models/user.js";

export const createPost = asyncHandler(async (req, res) => {
  const { title, video, prompt, author, image } = req.body;

  const { userId } = req.user;

  const videoResult = await cloudinary.uploader.upload(
    req.files.video.tempFilePath,
    {
      resource_type: "video",
      folder: "aora-videos",
    }
  );

  fs.unlinkSync(req.files.video.tempFilePath);

  const imageResult = await cloudinary.uploader.upload(
    req.files.image.tempFilePath,
    {
      use_filename: true,
      folder: "aora-videos",
    }
  );

  fs.unlinkSync(req.files.image.tempFilePath);

  const post = await Post.create({
    title,
    video: videoResult.secure_url,
    prompt,
    author: userId,
    image: imageResult.secure_url,
  });

  res.status(201).json({ success: true, post });
});

export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.find().populate("author", "-password");

  res.status(200).json({ success: true, post });
});

export const getSearch = asyncHandler(async (req, res) => {
  const { title } = req.query;

  let result = {};

  if (title) {
    result.title = { $regex: title, $options: "i" };
  }

  const post = await Post.find(result).sort("-createdAt");

  if (post.length < 1) {
    return res
      .status(400)
      .json({ success: false, err: `No result for - ${title} found` });
  }

  res.status(200).json({ success: true, post });
});

export const getPostByAuthor = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const userPost = await Post.find({ author: userId }).populate(
    "author",
    "-password"
  );



  res.status(200).json({ success: true, userPost });
});

export const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findByIdAndDelete({ _id: postId });

  res.status(200).json({ success: true, post });
});

export const savedPosts = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.user;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (!user.savedPosts.includes(postId)) {
    user.savedPosts.push(postId);
  }

  await user.save();

  res.status(200).json({ success: true, message: "Post saved successfully" });
});

export const getSavedPost = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const savedPosts = await Post.find({
    _id: { $in: user.savedPosts },
  }).populate("author", "-password");

  res.status(200).json({ success: true, savedPosts });
});

export const removeSavedPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.user;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Remove the postId from the savedPosts array
  user.savedPosts = user.savedPosts.filter(
    (savedPost) => savedPost.toString() !== postId
  );

  await user.save();

  res
    .status(200)
    .json({ success: true, message: "Post removed from saved posts" });
});

