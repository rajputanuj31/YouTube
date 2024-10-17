import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary ,deleteFromCloudinaryByUrl} from "../utils/cloudinary.js";

const uploadVideo = asyncHandler(async (req, res) => {
    const {title, description} = req.body;

    if (!title || !description) {
        throw new ApiError(400, "All fields are required");
    }

    const videoPath = req.files.videoFile[0]?.path;
    const thumbnailPath = req.files.thumbnail[0]?.path;
    const user = await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(400, "User not found");
    }
    if(!videoPath){
        throw new ApiError(400, "Video file is required");
    }
    if(!thumbnailPath){
        throw new ApiError(400, "thumbnail is required");
    }

    const video = await uploadOnCloudinary(videoPath);
    if(!video){
        throw new ApiError(400, "Failed to upload video");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailPath);
    if(!thumbnail){
        throw new ApiError(400, "Failed to upload thumbnail");
    }

    const newVideo = await Video.create({
        title,
        description,
        videoFile: video.url,
        thumbnail: thumbnail.url,
        duration: video.duration,
        views: 0,
        isPublished: true,
        owner: user._id,
        ownerUsername: user.username
    })
    if(!newVideo){
        throw new ApiError(500, "Failed to create video");
    }
    res.status(201).json(new ApiResponse(201, newVideo, "Video uploaded successfully"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "Video not found");
    }

    if (!req.user || !req.user._id) {
        throw new ApiError(403, "User not authenticated");
    }
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this video");
    }
    const videoFileUrl = video.videoFile;   
    const thumbnailUrl = video.thumbnail;
    await video.deleteOne({ _id: videoId });
    await deleteFromCloudinaryByUrl(videoFileUrl,"video");
    await deleteFromCloudinaryByUrl(thumbnailUrl,"image");
    res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"));
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "Video not found");
    }
    res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, isPublished } = req.body;
    if (!title && !description && !isPublished) {
        throw new ApiError(400, "Please provide at least one field to update");
    }
    const video = await Video.findByIdAndUpdate(
        videoId, 
        { 
            $set: { title, description, isPublished } 
        }, 
        { new: true }
    );
    const user = await User.findById(req.user?._id);
    if(!user){
        throw new ApiError(400, "User not found");
    }

    if (!video) {
        throw new ApiError(400, "Video not found");
    }
    if(video.owner.toString() !== user._id.toString()){
        throw new ApiError(403, "You are not allowed to update this video");
    }
    res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const skip = (pageNumber - 1) * limitNumber;

    const filterConditions = {};

    if(query){
        filterConditions.title = { $regex: query, $options: "i" };
    }

    if(userId){
        filterConditions.owner = userId;
    }
    const sortConditions = {};
    sortConditions[sortBy] = sortType === 'asc' ? 1 : -1;


    const videos = await Video.find(filterConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limitNumber);

    const totalVideos = await Video.countDocuments(filterConditions);
    const totalPages = Math.ceil(totalVideos / limitNumber);

    res.status(200).json(new ApiResponse(200, {videos, totalPages, currentPage: pageNumber}, "Videos fetched successfully"));

})

const getVideoOwnerDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "Video not found");
    }
    const channelDetails = await User.aggregate([
        {
            $match: {_id: video.owner}
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
    res.status(200).json(new ApiResponse(200, channelDetails[0], "Video owner details fetched successfully"));
});

const getVideoByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const videos = await Video.find({ owner: userId });
    res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
})
export {uploadVideo, deleteVideo, getVideoById, updateVideo, getAllVideos, getVideoOwnerDetails, getVideoByUserId};
