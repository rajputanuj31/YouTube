import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,  "./assets/temp");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

export const localFileUpload = multer({storage});
