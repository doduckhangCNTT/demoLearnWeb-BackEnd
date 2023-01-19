"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const saveBlogCtrl_1 = __importDefault(require("../controllers/saveBlogCtrl"));
const authUser_1 = __importDefault(require("../middleware/auth/authUser"));
const router = express_1.default.Router();
router.post("/bookmark/blog", authUser_1.default, saveBlogCtrl_1.default.createBlog);
router.get("/bookmark/blogs", authUser_1.default, saveBlogCtrl_1.default.getBlogs);
router.get("/bookmark/user/blogs/:id", authUser_1.default, saveBlogCtrl_1.default.getSaveBlogsUser);
router.delete("/bookmark/blog/:id", authUser_1.default, saveBlogCtrl_1.default.deleteBlog);
exports.default = router;
