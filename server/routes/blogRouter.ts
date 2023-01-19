import express from "express";
import blogCtrl from "../controllers/blogCtrl";
import authUser from "../middleware/auth/authUser";

const router = express.Router();

router.post("/blog", authUser, blogCtrl.createBlog);

router.get("/blog", blogCtrl.getBlogs);

router.get("/blogs", blogCtrl.getListBlogs);

router.get("/blog/draft", authUser, blogCtrl.getDraftBlogs);

router.get("/blog/category", blogCtrl.getBlogsCategory);

router.get("/blog/category/:id", blogCtrl.getBlogsRelativeCategory);

router.get("/blog/user/:id", authUser, blogCtrl.getBlogsUser);

router.get("/blogsPage", authUser, blogCtrl.getBlogsPage);

router.get("/blogsPageSearch", blogCtrl.getBlogsPageSearch);

router
  .route("/blog/:id")
  .get(blogCtrl.getBlog)
  .put(authUser, blogCtrl.updateBlog)
  .delete(authUser, blogCtrl.deleteBlog);

router
  .route("/draftBlog/:id")
  .get(blogCtrl.getDraftBlog)
  .delete(authUser, blogCtrl.deleteDraftBlog);
export default router;
