"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const CommentBlogSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Types.ObjectId, ref: "users" },
    blog_id: mongoose_1.default.Types.ObjectId,
    blog_of_userID: mongoose_1.default.Types.ObjectId,
    content: { type: String, required: true },
    reply_comment: [
        { type: mongoose_1.default.Types.ObjectId, ref: "replyCommentsBlog" },
    ],
    // reply_user: { type: mongoose.Types.ObjectId, ref: "users" },
    // comment_rootId: { type: mongoose.Types.ObjectId, ref: "commentsBlog" },
}, { timestamps: true });
exports.default = mongoose_1.default.model("commentsBlog", CommentBlogSchema);
