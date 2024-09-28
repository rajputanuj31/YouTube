import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";

const toggleLikeVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isLiked = await Like.findOne({ video: videoId, likedBy: userId });

    if (isLiked) {
        await Like.findByIdAndDelete(isLiked._id);
        video.likes = video.likes - 1;
        await video.save();
        return res.status(200).json(new ApiResponse(200, null, "Video unliked successfully"));
    }

    const newLike = await Like.create({ video: videoId, likedBy: userId });
    video.likes = video.likes + 1;
    await video.save();
    return res.status(200).json(new ApiResponse(200, newLike, "Video liked successfully"));
});

const toggleLikeComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isLiked = await Like.findOne({ comment: commentId, likedBy: userId });
    if (isLiked) {  
        await Like.findByIdAndDelete(isLiked._id);
        comment.likes = comment.likes - 1;
        await comment.save();
        return res.status(200).json(new ApiResponse(200, null, "Comment unliked successfully"));
    }

    const newLike = await Like.create({ comment: commentId, likedBy: userId });
    comment.likes = comment.likes + 1;
    await comment.save();
    return res.status(200).json(new ApiResponse(200, newLike, "Comment liked successfully"));
});

const toggleLikeTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isLiked = await Like.findOne({ tweet: tweetId, likedBy: userId });
    if (isLiked) {
        await Like.findByIdAndDelete(isLiked._id);
        tweet.likes = tweet.likes - 1;
        await tweet.save();
        return res.status(200).json(new ApiResponse(200, null, "Tweet unliked successfully"));
    }

    const newLike = await Like.create({ tweet: tweetId, likedBy: userId });
    tweet.likes = tweet.likes + 1;
    await tweet.save();
    return res.status(200).json(new ApiResponse(200, newLike, "Tweet liked successfully"));

});

const getAllLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const likedVideos = await Like.find({ likedBy: userId }).populate("video");
    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});

const getAllLikedComments = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const likedComments = await Like.find({ likedBy: userId }).populate("comment");
    return res.status(200).json(new ApiResponse(200, likedComments, "Liked comments fetched successfully"));
});

const getAllLikedTweets = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const likedTweets = await Like.find({ likedBy: userId }).populate("tweet");
    return res.status(200).json(new ApiResponse(200, likedTweets, "Liked tweets fetched successfully"));
});


export { toggleLikeVideo, toggleLikeComment, toggleLikeTweet, getAllLikedVideos, getAllLikedComments, getAllLikedTweets };