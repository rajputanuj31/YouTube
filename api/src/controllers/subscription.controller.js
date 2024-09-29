import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    console.log(channelId);
    if (!channelId) {
        throw new ApiError(400, "Channel ID is required");
    }

    const subscription = await Subscription.findOne({ subscriber: req.user._id, channel: channelId });

    if (subscription) {
        await Subscription.findByIdAndDelete(subscription._id);
        return res.status(200).json(
            new ApiResponse(200, { isSubscribed: false }, "Subscription removed successfully")
        );
    }

    const newSubscription = await Subscription.create({ subscriber: req.user._id, channel: channelId });

    return res.status(201).json(
        new ApiResponse(201, { isSubscribed: true, subscription: newSubscription }, "Subscription added successfully")
    );
});

const getSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required");
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $project: { 
                _id: 1,
                subscriber: 1
            }
        }
    ])
    if (!subscribers) {
        throw new ApiError(404, "Subscribers not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { subscribers, count: subscribers.length }, "Subscribers fetched successfully")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!subscriberId) {
        throw new ApiError(400, "Subscriber ID is required");
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails"
            }
        },
        {
            $project: {
                _id: 1,
                channel: 1
            }
        }
    ])

    if (!subscribedChannels) {
        throw new ApiError(404, "Subscribed channels not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { subscribedChannels, count: subscribedChannels.length }, "Subscribed channels fetched successfully")
    );
});

export { toggleSubscription, getSubscribers, getSubscribedChannels };