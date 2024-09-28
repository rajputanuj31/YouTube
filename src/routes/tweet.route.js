import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { addTweet, updateTweet, deleteTweet, getUserTweets } from "../controllers/tweet.controller.js";

const router = express.Router();

router.use(verifyAccessToken);

router.post("/add-tweet", addTweet);
router.patch("/update-tweet/:tweetId", updateTweet);
router.delete("/delete-tweet/:tweetId", deleteTweet);
router.get("/get-user-tweets/:userId", getUserTweets);

export default router;