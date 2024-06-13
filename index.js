import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import fileupload from "express-fileupload";
import userRouter from "./router/userRouter.js";
import postRouter from "./router/postRouter.js";

dotenv.config();
cloudinary.config({
  cloud_name: "dokfvj5ui",
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(
  fileupload({
    useTempFiles: true,
  })
);

app.get("/", (req, res) => {
  res.send("Home");
});

app.use("/api/v1/auth", userRouter);
app.use("/api/v1/posts", postRouter);

app.use((req, res) => {
  res.status(400).json({ err: "Page Not Found" });
});

const server = async () => {
  try {
    await mongoose.connect(process.env.MONGO, { dbName: "aora" });
    app.listen(PORT, () => console.log("Connected"));
  } catch (error) {
    console.log(error);
  }
};

server();
