import express from "express";
import uploadImgCtrl from "../controllers/uploadImgCtrl";
import authUser from "../middleware/auth/authUser";

const router = express.Router();

router.post("/upload", authUser, uploadImgCtrl.uploadImg);

router.post("/upload_imgVideo", authUser, uploadImgCtrl.uploadImgAndVideo);

router.post("/destroy", authUser, uploadImgCtrl.destroyImg);

router.post("/destroyVideo", authUser, uploadImgCtrl.destroyVideo);

export default router;
