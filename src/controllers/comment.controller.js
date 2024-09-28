import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    // Validate that the comment field is present and not empty
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "Unauthorized");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    const newComment = await Comment.create({ content: content, owner: user._id, video: video._id });
    res.status(200)
        .json(new ApiResponse(200, newComment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this comment");
    }
    const updatedComment = await Comment.findByIdAndUpdate(commentId, { content }, { new: true });
    res.status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized: Only comment owner can delete comment");
    }

    await comment.deleteOne();
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    );
});

const getCommentsByVideoId = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const {page = 1, limit = 10, sortBy = "createdAt", sortType = "desc"} = req.query
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const skip = (pageNumber - 1) * limitNumber;

    const filterConditions = { video: videoId };
    const sortConditions = {};
    sortConditions[sortBy] = sortType === 'asc' ? 1 : -1;

    const comments = await Comment.find(filterConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limitNumber);

    const totalComments = await Comment.countDocuments(filterConditions);
    const totalPages = Math.ceil(totalComments / limitNumber);
    
    res.status(200)
        .json(new ApiResponse(200, {comments, totalPages, currentPage: pageNumber}, "Comments fetched successfully"));
});

export { addComment , updateComment, deleteComment, getCommentsByVideoId};