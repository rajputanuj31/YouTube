import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { toggleSubscription, getSubscribers, getSubscribedChannels } from "../controllers/subscription.controller.js";
const router = express.Router();

router.post("/toggle-subscription/:channelId", verifyAccessToken, toggleSubscription);
router.get("/get-subscribers/:channelId", verifyAccessToken, getSubscribers);
router.get("/get-subscribed-channels/:subscriberId", verifyAccessToken, getSubscribedChannels);
export default router;