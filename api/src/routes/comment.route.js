import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { addComment, updateComment, deleteComment, getCommentsByVideoId } from "../controllers/comment.controller.js";

const router = express.Router();
router.use(verifyAccessToken);

router.post("/add-comment/:videoId", addComment);
router.patch("/update-comment/:commentId", updateComment);
router.delete("/delete-comment/:commentId", deleteComment);
router.get("/get-comments-by-video/:videoId", getCommentsByVideoId);

export default router;