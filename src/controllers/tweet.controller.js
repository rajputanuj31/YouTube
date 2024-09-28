import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";


const addTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const user = req.user;
    if (!content) {
        throw new ApiError(400, "Content is required");
    }
    if(!user) {
        throw new ApiError(401, "Unauthorized");
    }

    const tweet = await Tweet.create({
        content,
        owner: user._id
    });

    return res.status(201).json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }
    if (!content) {
        throw new ApiError(400, "Content is required");
    }
    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, { content }, { new: true });
    if (!updatedTweet) {
        throw new ApiError(404, "Tweet not found");
    }
    return res.status(200).json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if(!tweetId) {
        throw new ApiError(400, "Tweet id is required");
    }
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }
    await Tweet.findByIdAndDelete(tweetId);

    return res.status(200).json(new ApiResponse(200, null, "Tweet deleted successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
        throw new ApiError(400, "User id is required");
    }
    const user = req.user;
    if (!user) {
        throw new ApiError(401, "Unauthorized");
    }
    const tweets = await Tweet.find({ owner: userId });
    return res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

export { addTweet, updateTweet, deleteTweet, getUserTweets };