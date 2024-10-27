import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { createPlaylist, addVideoToPlaylist, removeVideoFromPlaylist, getPlaylistById, getPlaylistsByUserId, deletePlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = express.Router();

router.use(verifyAccessToken);

router.post("/create-playlist", createPlaylist);
router.patch("/add-video-to-playlist/:playlistId/:videoId", addVideoToPlaylist);
router.post("/remove-video-from-playlist/:playlistId/:videoId", removeVideoFromPlaylist);
router.get("/get-playlist/:playlistId", getPlaylistById);
router.get("/get-playlists-by-user/:userId", getPlaylistsByUserId);
router.delete("/delete-playlist/:playlistId", deletePlaylist);
router.patch("/update-playlist/:playlistId", updatePlaylist);
export default router;