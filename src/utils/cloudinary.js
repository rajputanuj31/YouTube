import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!fs.existsSync(localFilePath)) {
            throw new Error("File not found");
        }

        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        fs.unlinkSync(localFilePath);
        return result;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.error("Error uploading video to cloudinary", error);
        throw error;
    }
}

const deleteFromCloudinaryByUrl = async (url,type) => {
    try {
        const parts = url.split('/');
        // Get the last part of the URL and remove the extension
        const publicId = parts[parts.length - 1].split('.')[0];

        await cloudinary.uploader.destroy(publicId, { resource_type: type });
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
    }
}



export {uploadOnCloudinary, deleteFromCloudinaryByUrl}