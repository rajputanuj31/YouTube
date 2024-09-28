import express from "express";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { createPlaylist, addVideoToPlaylist, removeVideoFromPlaylist, getPlaylistById, getPlaylistsByUserId, deletePlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = express.Router();

router.post("/create-playlist/:videoId",verifyAccessToken,createPlaylist);
router.patch("/add-video-to-playlist/:playlistId/:videoId",verifyAccessToken,addVideoToPlaylist);
router.post("/remove-video-from-playlist/:playlistId/:videoId",verifyAccessToken,removeVideoFromPlaylist);
router.get("/get-playlist/:playlistId",verifyAccessToken,getPlaylistById);
router.get("/get-playlists-by-user/:userId",verifyAccessToken,getPlaylistsByUserId);
router.delete("/delete-playlist/:playlistId",verifyAccessToken,deletePlaylist);
router.patch("/update-playlist/:playlistId",verifyAccessToken,updatePlaylist);
export default router;