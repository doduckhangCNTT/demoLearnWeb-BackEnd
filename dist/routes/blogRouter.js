"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const blogCtrl_1 = __importDefault(require("../controllers/blogCtrl"));
const authUser_1 = __importDefault(require("../middleware/auth/authUser"));
const router = express_1.default.Router();
router.post("/blog", authUser_1.default, blogCtrl_1.default.createBlog);
router.get("/blog", blogCtrl_1.default.getBlogs);
router.get("/blogs", blogCtrl_1.default.getListBlogs);
router.get("/blog/draft", authUser_1.default, blogCtrl_1.default.getDraftBlogs);
router.get("/blog/category", blogCtrl_1.default.getBlogsCategory);
router.get("/blog/category/:id", blogCtrl_1.default.getBlogsRelativeCategory);
router.get("/blog/user/:id", authUser_1.default, blogCtrl_1.default.getBlogsUser);
router.get("/blogsPage", authUser_1.default, blogCtrl_1.default.getBlogsPage);
router.get("/blogsPageSearch", blogCtrl_1.default.getBlogsPageSearch);
router
    .route("/blog/:id")
    .get(blogCtrl_1.default.getBlog)
    .put(authUser_1.default, blogCtrl_1.default.updateBlog)
    .delete(authUser_1.default, blogCtrl_1.default.deleteBlog);
router
    .route("/draftBlog/:id")
    .get(blogCtrl_1.default.getDraftBlog)
    .delete(authUser_1.default, blogCtrl_1.default.deleteDraftBlog);
exports.default = router;
