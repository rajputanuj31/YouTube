import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const { videoId } = req.params;

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required");
    }

    if (!videoId) {
        throw new ApiError(400, "Video is required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        videos: [videoId],
        owner: req.user._id
    });

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist and video are required");
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        $push: { videos: videoId }
    }, { new: true });

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added to playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist and video are required");
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        $pull: { videos: videoId }
    }, { new: true });

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video removed from playlist successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Playlist is required");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const getPlaylistsByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "User is required");
    }

    const playlists = await Playlist.find({ owner: userId });

    if (!playlists) {
        throw new ApiError(404, "Playlists not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Playlist is required");
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!playlistId) {
        throw new ApiError(400, "Playlist is required");
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, { name, description }, { new: true });

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export { createPlaylist, addVideoToPlaylist, removeVideoFromPlaylist, getPlaylistById, getPlaylistsByUserId, deletePlaylist, updatePlaylist  };