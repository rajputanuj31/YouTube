import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const verifyAccessToken = asyncHandler(async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1];
        if (!accessToken) {
            return next(new ApiError(401, "Unauthorized"));
        }
    
        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            return next(new ApiError(401, "Unauthorized"));
        }
        req.user = user;
        next();
    } catch (error) {
        next(new ApiError(401, "Unauthorized"));
    }
});

export { verifyAccessToken };