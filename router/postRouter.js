import { Router } from "express";
import {
  createPost,
  getPost,
  getPostByAuthor,
  getSearch,
  deletePost,
  savedPosts,
  getSavedPost,
  removeSavedPost,
} from "../controller/postController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.route("/").post(auth, createPost).get(auth, getPost);
router.get("/author", auth, getPostByAuthor);
router.get("/q", getSearch);
router.route("/:postId").delete(deletePost);
router.put("/save/:postId", auth, savedPosts);
router.get("/save", auth, getSavedPost);
router.delete("/save/:postId", auth, removeSavedPost);

export default router;
