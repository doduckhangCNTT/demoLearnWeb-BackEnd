import mongoose from "mongoose";
import { IReplyCommentBlog } from "../config/interface";

const replyCommentsBlogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "users" },
    blog_id: mongoose.Types.ObjectId,
    blog_of_userID: mongoose.Types.ObjectId,

    content: { type: String, required: true },
    reply_comment: [
      { type: mongoose.Types.ObjectId, ref: "replyCommentsBlog" },
    ],
    reply_user: { type: mongoose.Types.ObjectId, ref: "users" },
    rootComment_answeredId: {
      type: mongoose.Types.ObjectId,
      ref: "replyCommentsBlog",
    },
    originCommentHightestId: {
      type: mongoose.Types.ObjectId,
      ref: "replyCommentsBlog",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IReplyCommentBlog>(
  "replyCommentsBlog",
  replyCommentsBlogSchema
);
