import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary , deleteFromCloudinaryByUrl} from "../utils/cloudinary.js";
import mongoose from "mongoose";

const changeUserPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    if (!user) {
        return next(new ApiError(404, "User not found"));
    }
    const isPasswordValid = await user.isPasswordValid(currentPassword);
    if (!isPasswordValid) {
        return next(new ApiError(400, "Invalid current password"));
    }
    user.password = newPassword;
    await user.save({validateBeforeSave: false});
    res.status(200).json(new ApiResponse(200, true, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"))
});

const updateAccountDetails = asyncHandler( async (req, res) => {
    const {email, fullName, username} = req.body;

    if (!email && !username && fullName) {
        throw new ApiError(400, "Please provide at least one field to update");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {email, username, fullName}
        },
        {new: true}
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, user, "User updated successfully"));

})

const updateAvatar = asyncHandler(async (req, res) => {
    const currentAvatarUrl = req.user.avatar;
    const avatarLocalPath = req.file?.path;
    console.log(req.file);
    if (!avatarLocalPath) {
        throw new ApiError(400, "Please provide an avatar image");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(500, "Failed to upload avatar on cloudinary");
    }
    const user = await User.findByIdAndUpdate(req.user?._id, {$set: {avatar: avatar.url}}, {new: true}).select("-password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    await deleteFromCloudinaryByUrl(currentAvatarUrl);

    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
    const currentCoverImageUrl = req.user.coverImage;
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Please provide an cover image");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw new ApiError(500, "Failed to upload cover image on cloudinary");
    }
    const user = await User.findByIdAndUpdate(req.user?._id, {$set: {coverImage: coverImage.url}}, {new: true}).select("-password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    if (currentCoverImageUrl) {
        await deleteFromCloudinaryByUrl(currentCoverImageUrl);
    }
    return res.status(200).json(new ApiResponse(200, user, "Cover image updated successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
    const user = req.user;
    await User.findByIdAndDelete(user._id);

    await deleteFromCloudinaryByUrl(user.avatar);
    if (user.coverImage) {
        const publicId = extractPublicIdFromUrl(user.coverImage);
        await deleteFromCloudinary(publicId);
    }
    return res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});

const getUserChannelDetails = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const channelDetails = await User.aggregate([
        {
            $match: {_id: new mongoose.Types.ObjectId(userId)}
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                totalSubscribers: {$size: "$subscribers"},
                totalSubscriptions: {$size: "$subscribedTo"},
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                totalSubscribers: 1,
                totalSubscriptions: 1,
                isSubscribed: 1
            }
        }
    ])

    if (!channelDetails?.length) {
        throw new ApiError(404, "Channel not found");
    }

    return res.status(200).json(new ApiResponse(200, channelDetails[0], "Channel details fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {_id: new mongoose.Types.ObjectId(req.user._id)}
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                    $lookup: { 
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [{
                            $project: {
                                username: 1,
                                fullName: 1,
                                avatar: 1
                            }
                        }]
                    }
                },
                {
                    $addFields: {
                        owner: {
                            $first: "$owner"
                        }
                    }
                }
            ]
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"));
});

const addToWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.body; // Get videoId from request body
    const user = await User.findById(req.user._id); // Find the user

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if videoId is already in watchHistory
    if (user.watchHistory.includes(videoId)) {
        return res.status(400).json(new ApiResponse(400, false, "Video already in watch history"));
    }

    // Add videoId to watchHistory
    user.watchHistory.push(videoId);
    await user.save(); // Save the updated user

    return res.status(200).json(new ApiResponse(200, user.watchHistory, "Video added to watch history successfully"));
});

export { changeUserPassword, getCurrentUser, updateAccountDetails, updateAvatar, updateCoverImage, deleteUser, getWatchHistory , getUserChannelDetails, addToWatchHistory};