import mongoose from "mongoose";
import { IComment } from "../config/interface";

const CommentBlogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "users" },
    blog_id: mongoose.Types.ObjectId,
    blog_of_userID: mongoose.Types.ObjectId,

    content: { type: String, required: true },
    reply_comment: [
      { type: mongoose.Types.ObjectId, ref: "replyCommentsBlog" },
    ],
    // reply_user: { type: mongoose.Types.ObjectId, ref: "users" },
    // comment_rootId: { type: mongoose.Types.ObjectId, ref: "commentsBlog" },
  },
  { timestamps: true }
);

export default mongoose.model<IComment>("commentsBlog", CommentBlogSchema);
