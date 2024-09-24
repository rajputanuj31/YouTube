import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "access and refresh token generation failed");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password } = req.body;

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

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    
    if (!email && !username ) {
        throw new ApiError(400, "Email or username is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const isUserExists = await User.findOne({ $or: [{ email }, { username }] });

    if (!isUserExists) {
        throw new ApiError(400, "User not found");
    }

    const isPasswordCorrect = await isUserExists.isPasswordValid(password);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(isUserExists._id);

    const user = await User.findById(isUserExists._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(400, "User not found");
    }

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    return res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, { user, accessToken, refreshToken }, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {

    const user = req.user;
    await User.findByIdAndUpdate(user._id, { $set: { refreshToken: null } }, { new: true });
    const cookieOptions = {
        httpOnly: true,
        secure: true,
    }
    
    return res.status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
