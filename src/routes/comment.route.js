import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { addComment, updateComment, deleteComment, getCommentsByVideoId } from "../controllers/comment.controller.js";

const router = express.Router();

router.post("/add-comment/:videoId", verifyAccessToken, addComment);
router.patch("/update-comment/:commentId", verifyAccessToken, updateComment);
router.delete("/delete-comment/:commentId", verifyAccessToken, deleteComment);
router.get("/get-comments-by-video/:videoId", verifyAccessToken, getCommentsByVideoId);

export default router;