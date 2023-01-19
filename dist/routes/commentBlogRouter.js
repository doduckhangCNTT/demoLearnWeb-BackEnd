"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const commentBlogCtrl_1 = __importDefault(require("../controllers/commentBlogCtrl"));
const authUser_1 = __importDefault(require("../middleware/auth/authUser"));
const router = express_1.default.Router();
router.get("/comment/blog/:id", commentBlogCtrl_1.default.getCommentsBlog);
router.post("/comment", authUser_1.default, commentBlogCtrl_1.default.createCommentBlog);
router
    .route("/comment/:id")
    .patch(authUser_1.default, commentBlogCtrl_1.default.updateCommentBlog)
    .delete(authUser_1.default, commentBlogCtrl_1.default.deleteCommentBlog);
// router
//   .route("/comment/root/:id")
//   .patch(authUser, commentBlogCtrl.deleteCommentRootBlog);
exports.default = router;
