import { Response } from "express";
import { IReqAuth } from "../config/interface";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_IMG_NAME,
  api_key: process.env.CLOUD_IMG_API_KEY,
  api_secret: process.env.CLOUD_IMG_API_SECRET,
});

const uploadImgCtrl = {
  uploadImg: async (req: IReqAuth, res: Response) => {
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

      cloudinary.uploader.upload(
        file.tempFilePath,
        { folder: "learnWeb" },
        (err, result) => {
          if (err) throw err;
          res.json(result);
          // res.json({ public_id: result.public_id, url: result.secure_url });
        }
      );
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  uploadImgAndVideo: async (req: IReqAuth, res: Response) => {
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

      cloudinary.uploader.upload(
        file.tempFilePath,
        { folder: "learnWeb", resource_type: "auto" },
        (err, result) => {
          if (err) throw err;
          res.json(result);
          // res.json({ public_id: result.public_id, url: result.secure_url });
        }
      );
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  destroyImg: async (req: IReqAuth, res: Response) => {
    if (!req.user)
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Authentication 41" });

    try {
      const { public_id } = req.body;
      console.log("Public_id: ", public_id);

      if (!public_id)
        return res.status(400).json({ success: false, msg: "Img not found" });

      cloudinary.uploader.destroy(public_id, (err: any) => {
        if (err) throw err;
        res.json({ success: true, msg: "Delete image successfully" });
      });
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  destroyVideo: async (req: IReqAuth, res: Response) => {
    if (!req.user)
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Authentication 42" });

    try {
      const { public_id } = req.body;
      console.log("Public_id: ", public_id);

      if (!public_id)
        return res.status(400).json({ success: false, msg: "Img not found" });

      cloudinary.uploader.destroy(
        public_id,
        { resource_type: "video" },
        (err: any) => {
          if (err) throw err;
          res.json({ success: true, msg: "Delete image successfully" });
        }
      );
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },
};

const removeTmp = (path: string) => {
  fs.unlink(path, (err) => {
    console.error(err);
  });
};

export default uploadImgCtrl;
