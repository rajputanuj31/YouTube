import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { toggleSubscription, getSubscribers, getSubscribedChannels } from "../controllers/subscription.controller.js";
const router = express.Router();

router.use(verifyAccessToken);

router.post("/toggle-subscription/:channelId", toggleSubscription);
router.get("/get-subscribers/:channelId", getSubscribers);
router.get("/get-subscribed-channels/:subscriberId", getSubscribedChannels);
export default router;