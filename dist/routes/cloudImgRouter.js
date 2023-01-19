"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploadImgCtrl_1 = __importDefault(require("../controllers/uploadImgCtrl"));
const authUser_1 = __importDefault(require("../middleware/auth/authUser"));
const router = express_1.default.Router();
router.post("/upload", authUser_1.default, uploadImgCtrl_1.default.uploadImg);
router.post("/upload_imgVideo", authUser_1.default, uploadImgCtrl_1.default.uploadImgAndVideo);
router.post("/destroy", authUser_1.default, uploadImgCtrl_1.default.destroyImg);
router.post("/destroyVideo", authUser_1.default, uploadImgCtrl_1.default.destroyVideo);
exports.default = router;
