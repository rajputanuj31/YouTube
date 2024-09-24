import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary , deleteFromCloudinaryByUrl} from "../utils/cloudinary.js";

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
    ).select("-password");

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
    const user = await User.findByIdAndUpdate(req.user?._id, {$set: {avatar: coverImage.url}}, {new: true}).select("-password");
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


export { changeUserPassword, getCurrentUser, updateAccountDetails, updateAvatar, updateCoverImage, deleteUser };