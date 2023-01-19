import express from "express";
import replyCommentsBlogCtrl from "../controllers/replyComment/replyCommentBlogCtrl";
import authUser from "../middleware/auth/authUser";

const router = express.Router();

router.get(
  "/reply/comment/blog/:id",
  replyCommentsBlogCtrl.getCommentsReplyBlog
);

router.post(
  "/reply/comment",
  authUser,
  replyCommentsBlogCtrl.createCommentReplyBlog
);

router
  .route("/reply/comment/:id")
  .patch(authUser, replyCommentsBlogCtrl.updateCommentReplyBlog)
  .delete(authUser, replyCommentsBlogCtrl.deleteCommentReplyBlog);

router
  .route("/reply/comment/root/:id")
  .patch(authUser, replyCommentsBlogCtrl.deleteCommentRootBlog);

export default router;
