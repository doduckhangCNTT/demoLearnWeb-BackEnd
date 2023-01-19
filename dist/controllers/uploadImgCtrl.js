"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_IMG_NAME,
    api_key: process.env.CLOUD_IMG_API_KEY,
    api_secret: process.env.CLOUD_IMG_API_SECRET,
});
const uploadImgCtrl = {
    uploadImg: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res
                .status(400)
                .json({ success: false, msg: "Invalid Authentication 39" });
        try {
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).json({ success: false, msg: "File not found" });
            }
            const file = req.files.file;
            if (file.size > 1024 * 1024 * 1024) {
                removeTmp(file.tempFilePath);
                return res
                    .status(400)
                    .json({ success: false, msg: "File size is too large" });
            }
            if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
                removeTmp(file.tempFilePath);
                return res
                    .status(400)
                    .json({ success: false, msg: "File is not incorrect format" });
            }
            cloudinary_1.v2.uploader.upload(file.tempFilePath, { folder: "learnWeb" }, (err, result) => {
                if (err)
                    throw err;
                res.json(result);
                // res.json({ public_id: result.public_id, url: result.secure_url });
            });
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
    uploadImgAndVideo: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res
                .status(400)
                .json({ success: false, msg: "Invalid Authentication 40" });
        try {
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).json({ success: false, msg: "File not found" });
            }
            const file = req.files.file;
            console.log("File: ", file);
            // if (file.size > 1024 * 1024 * 1024) {
            //   removeTmp(file.tempFilePath);
            //   return res
            //     .status(400)
            //     .json({ success: false, msg: "File size is too large" });
            // }
            // if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
            //   removeTmp(file.tempFilePath);
            //   return res
            //     .status(400)
            //     .json({ success: false, msg: "File is not incorrect format" });
            // }
            cloudinary_1.v2.uploader.upload(file.tempFilePath, { folder: "learnWeb", resource_type: "auto" }, (err, result) => {
                if (err)
                    throw err;
                res.json(result);
                // res.json({ public_id: result.public_id, url: result.secure_url });
            });
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
    destroyImg: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res
                .status(400)
                .json({ success: false, msg: "Invalid Authentication 41" });
        try {
            const { public_id } = req.body;
            console.log("Public_id: ", public_id);
            if (!public_id)
                return res.status(400).json({ success: false, msg: "Img not found" });
            cloudinary_1.v2.uploader.destroy(public_id, (err) => {
                if (err)
                    throw err;
                res.json({ success: true, msg: "Delete image successfully" });
            });
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
    destroyVideo: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res
                .status(400)
                .json({ success: false, msg: "Invalid Authentication 42" });
        try {
            const { public_id } = req.body;
            console.log("Public_id: ", public_id);
            if (!public_id)
                return res.status(400).json({ success: false, msg: "Img not found" });
            cloudinary_1.v2.uploader.destroy(public_id, { resource_type: "video" }, (err) => {
                if (err)
                    throw err;
                res.json({ success: true, msg: "Delete image successfully" });
            });
        }
        catch (error) {
            res.status(500).json({ success: false, msg: error.message });
        }
    }),
};
const removeTmp = (path) => {
    fs_1.default.unlink(path, (err) => {
        console.error(err);
    });
};
exports.default = uploadImgCtrl;
