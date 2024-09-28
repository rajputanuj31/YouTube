import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { toggleLikeVideo, getAllLikedVideos } from "../controllers/like.controller.js";
const router = express.Router();

router.post("/toggle-like-video/:videoId", verifyAccessToken, toggleLikeVideo);
router.get("/get-all-liked-videos", verifyAccessToken, getAllLikedVideos);

export default router;