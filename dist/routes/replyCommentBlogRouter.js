"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const replyCommentBlogCtrl_1 = __importDefault(require("../controllers/replyComment/replyCommentBlogCtrl"));
const authUser_1 = __importDefault(require("../middleware/auth/authUser"));
const router = express_1.default.Router();
router.get("/reply/comment/blog/:id", replyCommentBlogCtrl_1.default.getCommentsReplyBlog);
router.post("/reply/comment", authUser_1.default, replyCommentBlogCtrl_1.default.createCommentReplyBlog);
router
    .route("/reply/comment/:id")
    .patch(authUser_1.default, replyCommentBlogCtrl_1.default.updateCommentReplyBlog)
    .delete(authUser_1.default, replyCommentBlogCtrl_1.default.deleteCommentReplyBlog);
router
    .route("/reply/comment/root/:id")
    .patch(authUser_1.default, replyCommentBlogCtrl_1.default.deleteCommentRootBlog);
exports.default = router;
