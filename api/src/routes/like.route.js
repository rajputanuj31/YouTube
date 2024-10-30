import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { toggleLikeVideo, getAllLikedVideos, toggleLikeComment, getAllLikedComments, toggleLikeTweet, getAllLikedTweets, getLikesByVideoId } from "../controllers/like.controller.js";
const router = express.Router();

router.use(verifyAccessToken);

router.post("/toggle-like-video/:videoId", toggleLikeVideo);
router.get("/get-all-liked-videos", getAllLikedVideos);
router.post("/toggle-like-comment/:commentId", toggleLikeComment);
router.get("/get-all-liked-comments", getAllLikedComments);
router.post("/toggle-like-tweet/:tweetId", toggleLikeTweet);
router.get("/get-all-liked-tweets", getAllLikedTweets);
router.get("/get-likes-by-videoId/:videoId",getLikesByVideoId);

export default router;