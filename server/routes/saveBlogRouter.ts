import express from "express";
import saveBlogCtrl from "../controllers/saveBlogCtrl";
import authUser from "../middleware/auth/authUser";

const router = express.Router();

router.post("/bookmark/blog", authUser, saveBlogCtrl.createBlog);

router.get("/bookmark/blogs", authUser, saveBlogCtrl.getBlogs);

router.get("/bookmark/user/blogs/:id", authUser, saveBlogCtrl.getSaveBlogsUser);

router.delete("/bookmark/blog/:id", authUser, saveBlogCtrl.deleteBlog);

export default router;
