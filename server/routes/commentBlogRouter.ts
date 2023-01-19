import express from "express";
import commentBlogCtrl from "../controllers/commentBlogCtrl";
import authUser from "../middleware/auth/authUser";

const router = express.Router();

router.get("/comment/blog/:id", commentBlogCtrl.getCommentsBlog);

router.post("/comment", authUser, commentBlogCtrl.createCommentBlog);

router
  .route("/comment/:id")
  .patch(authUser, commentBlogCtrl.updateCommentBlog)
  .delete(authUser, commentBlogCtrl.deleteCommentBlog);

// router
//   .route("/comment/root/:id")
//   .patch(authUser, commentBlogCtrl.deleteCommentRootBlog);
export default router;
