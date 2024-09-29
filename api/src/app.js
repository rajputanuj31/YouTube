import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.route.js";
import videoRoutes from "./routes/video.route.js";
import likeRoutes from "./routes/like.route.js";
import commentRoutes from "./routes/comment.route.js";
import playlistRoutes from "./routes/playlist.route.js"
import subscriptionRoutes from "./routes/subscription.route.js"
import tweetRoutes from "./routes/tweet.route.js"
import dotenv from "dotenv";

dotenv.config(); // Load environment variables


const app = express();

app.use(cookieParser());

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);
app.use("/api/v1/tweets", tweetRoutes);

export { app };