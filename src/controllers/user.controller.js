import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password } = req.body;
    console.log(email, username, password);

    if (!fullName || !username || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    // Correct the query to use $or with an array of conditions
    const userExists = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (userExists) {
        throw new ApiError(409, "User already exists");
    }

    const avatarpath = req.files.avatar[0]?.path;
    let coverImagepath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImagepath = req.files.coverImage[0].path;
    }

    if (!avatarpath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarpath);
    const coverImage = coverImagepath ? await uploadOnCloudinary(coverImagepath) : null;

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        username,
        email,
        password,
        avatar: avatar.url || "",
        coverImage: coverImage?.url || "",
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(400, "User not created");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User created successfully"));
});