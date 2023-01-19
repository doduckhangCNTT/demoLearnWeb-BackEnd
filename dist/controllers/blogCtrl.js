"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const node_cache_1 = __importDefault(require("node-cache"));
const valid_1 = require("../middleware/valid");
const blogModel_1 = __importDefault(require("../models/blogModel"));
const draftBlogsModel_1 = __importDefault(require("../models/draftBlogsModel"));
const userModel_1 = __importDefault(require("../models/userModel"));
const PageConfig = (req) => {
    const limit = Number(req.query.limit) * 1 || 3;
    const page = Number(req.query.page) * 1 || 1;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
const myCache = new node_cache_1.default({ stdTTL: 100, checkperiod: 120 });
const blogCtrl = {
    getBlogs: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { limit, skip } = PageConfig(req);
        const key = req.originalUrl;
        if (myCache.has(key)) {
            const cacheResponseBlogs = yield myCache.get(key);
            res.json(cacheResponseBlogs);
        }
        try {
            // const blogs = await Blogs.find().sort("-createdAt");
            const Data = yield blogModel_1.default.aggregate([
                {
                    $facet: {
                        totalData: [
                            {
                                $lookup: {
                                    from: "users",
                                    let: { user_id: "$user" },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                                        { $project: { password: 0 } },
                                    ],
                                    as: "user",
                                },
                            },
                            { $unwind: "$user" },
                            {
                                $lookup: {
                                    from: "categories",
                                    let: { category_id: "$category" },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ["$_id", "$$category_id"] } } },
                                    ],
                                    as: "category",
                                },
                            },
                            { $unwind: "$category" },
                            { $sort: { createdAt: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                        ],
                        totalCount: [{ $count: "count" }],
                    },
                },
                {
                    $project: {
                        count: { $arrayElemAt: ["$totalCount.count", 0] },
                        totalData: 1,
                    },
                },
            ]);
            const blogs = Data[0].totalData;
            const count = Data[0].count;
            let total;
            if (count % limit === 0) {
                total = count / limit;
            }
            else {
                total = Math.floor(count / limit) + 1;
            }
            // Neu muon hien thi tong so trang
            // res.json({ blogs, total });
            myCache.set(key, blogs);
            res.json(blogs);
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    getListBlogs: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // console.log("Req: ", req.query.limit);
        const { limit, skip, page } = PageConfig(req);
        // console.log({ limit, skip, page });
        try {
            // const blogs = await Blogs.find().sort("-createdAt");
            const blogs = yield blogModel_1.default.aggregate([
                {
                    $lookup: {
                        from: "users",
                        let: { user_id: "$user" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                            { $project: { password: 0 } },
                        ],
                        as: "user",
                    },
                },
                { $unwind: "$user" },
                {
                    $lookup: {
                        from: "categories",
                        let: { category_id: "$category" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$category_id"] } } },
                        ],
                        as: "category",
                    },
                },
                { $unwind: "$category" },
            ]);
            res.json(blogs);
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    getDraftBlogs: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // const blogs = await Blogs.find().sort("-createdAt");
            const blogs = yield draftBlogsModel_1.default.aggregate([
                {
                    $lookup: {
                        from: "users",
                        let: { user_id: "$user" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                            { $project: { password: 0 } },
                        ],
                        as: "user",
                    },
                },
                { $unwind: "$user" },
                {
                    $lookup: {
                        from: "categories",
                        let: { category_id: "$category" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$category_id"] } } },
                        ],
                        as: "category",
                    },
                },
                { $unwind: "$category" },
                { $sort: { createdAt: -1 } },
            ]);
            res.json(blogs);
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    getBlogsPage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { skip, limit } = PageConfig(req);
        const key = req.originalUrl;
        if (myCache.has(key)) {
            const cacheResponseBlogsPageSearch = myCache.get(key);
            res.json(cacheResponseBlogsPageSearch);
        }
        try {
            const blogs = yield blogModel_1.default.find();
            const blogsValue = yield blogModel_1.default.find()
                .skip(skip)
                .limit(limit)
                .populate("user")
                .populate("category");
            myCache.set(key, { blogs: blogsValue, totalCount: blogs.length });
            res.json({ blogs: blogsValue, totalCount: blogs.length });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
    getBlogsPageSearch: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { skip, limit } = PageConfig(req);
        const key = req.originalUrl;
        if (myCache.has(key)) {
            const cacheResponseBlogsPageSearch = yield myCache.get(key);
            res.json(cacheResponseBlogsPageSearch);
        }
        try {
            const { search } = req.query;
            if ((0, valid_1.validEmail)((search === null || search === void 0 ? void 0 : search.toString()) ? search.toString() : "")) {
                const user = yield userModel_1.default.findOne({ account: search });
                if (!user) {
                    return res.json({ success: false, msg: "User not found" });
                }
                const blogs = yield blogModel_1.default.find();
                const blogsValue = yield blogModel_1.default.find({ user: user._id })
                    .skip(skip)
                    .limit(limit)
                    .populate("user")
                    .populate("category");
                myCache.set(key, { blogs: blogsValue, totalCount: blogs.length });
                res.json({ blogs: blogsValue, totalCount: blogs.length });
            }
            else if ((_a = search === null || search === void 0 ? void 0 : search.toString()) === null || _a === void 0 ? void 0 : _a.match(/^[0-9a-fA-F]{24}$/)) {
                const blog = yield blogModel_1.default.find({ _id: search.toString() });
                myCache.set(key, { blogs: blog, totalCount: 1 });
                res.json({ blogs: blog, totalCount: 1 });
            }
            else {
                const blogs = yield blogModel_1.default.find({
                    title: (search === null || search === void 0 ? void 0 : search.toString()) ? search.toString() : "",
                });
                const blogsValue = yield blogModel_1.default.find({
                    title: (search === null || search === void 0 ? void 0 : search.toString()) ? search.toString() : "",
                })
                    .skip(skip)
                    .limit(limit)
                    .populate("user")
                    .populate("category");
                myCache.set(key, { blogs: blogsValue, totalCount: blogs.length });
                res.json({ blogs: blogsValue, totalCount: blogs.length });
            }
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
    createBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res
                .status(400)
                .json({ success: false, error: "Initial Authentication 13" });
        try {
            const { title, content, description, thumbnail, category, classify } = req.body;
            let newBlog;
            if (classify.toLowerCase() === "create") {
                newBlog = new blogModel_1.default({
                    user: req.user._id,
                    title: title,
                    content: content,
                    description: description,
                    thumbnail: thumbnail,
                    category: category,
                });
                yield newBlog.save();
            }
            else if (classify.toLowerCase() === "draft") {
                newBlog = new draftBlogsModel_1.default({
                    user: req.user._id,
                    title: title,
                    content: content,
                    description: description,
                    thumbnail: thumbnail,
                    category: category,
                });
                yield newBlog.save();
                console.log({ newBlog });
            }
            res.json(Object.assign(Object.assign({}, newBlog._doc), { user: req.user, msg: classify === "create"
                    ? "Create Blog successfully"
                    : "Move blog from  Draft Blog successfully" }));
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    getBlogsRelativeCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const Data = yield blogModel_1.default.aggregate([
                {
                    $facet: {
                        totalData: [
                            {
                                $match: {
                                    // convert id: string --> objectId
                                    category: new mongoose_1.default.Types.ObjectId(req.params.id),
                                },
                            },
                            {
                                $lookup: {
                                    from: "users",
                                    let: { user_id: "$user" },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                                        { $project: { password: 0 } },
                                    ],
                                    as: "user",
                                },
                            },
                            { $unwind: "$user" },
                            { $sort: { createdAt: -1 } },
                        ],
                        totalCount: [
                            {
                                $match: {
                                    category: new mongoose_1.default.Types.ObjectId(req.params.id),
                                },
                            },
                            { $count: "count" },
                        ],
                    },
                },
                {
                    $project: {
                        totalData: 1,
                        count: { $arrayElemAt: ["$totalCount.count", 0] },
                    },
                },
            ]);
            const blogs = Data[0].totalData;
            const count = Data[0].count;
            res.json({ blogs, count });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    getBlogsCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const key = req.originalUrl;
        if (myCache.has(key)) {
            const cacheResponseBlogsCategory = yield myCache.get(key);
            res.json(cacheResponseBlogsCategory);
        }
        try {
            // const blogs = await Blogs.find().sort("-createdAt");
            const blogs = yield blogModel_1.default.aggregate([
                {
                    $lookup: {
                        from: "users",
                        let: { user_id: "$user" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                            { $project: { password: 0 } },
                        ],
                        as: "user",
                    },
                },
                { $unwind: "$user" },
                {
                    $lookup: {
                        from: "categories",
                        let: { category_id: "$category" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$category_id"] } } },
                        ],
                        as: "category",
                    },
                },
                { $unwind: "$category" },
                { $sort: { createdAt: -1 } },
                {
                    $group: {
                        _id: "$category._id",
                        category: { $first: "$category" },
                        blogs: { $push: "$$ROOT" },
                        count: { $sum: 1 },
                    },
                },
            ]);
            myCache.set(key, blogs);
            res.json(blogs);
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    getBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const blog = yield blogModel_1.default.findOne({ _id: req.params.id }).populate("user", "-password");
            if (!blog)
                return res
                    .status(400)
                    .json({ success: false, error: "Blog not found" });
            res.json({ success: true, blog });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    getDraftBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const blog = yield draftBlogsModel_1.default.findOne({ _id: req.params.id }).populate("user", "-password");
            if (!blog)
                return res
                    .status(400)
                    .json({ success: false, error: "Blog not found" });
            res.json({ success: true, blog });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    getBlogsUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const key = req.originalUrl;
        if (myCache.has(key)) {
            const cacheResponseBlogsUser = yield myCache.get(key);
            res.json(cacheResponseBlogsUser);
        }
        try {
            const Data = yield blogModel_1.default.aggregate([
                {
                    $facet: {
                        totalData: [
                            {
                                $match: {
                                    user: new mongoose_1.default.Types.ObjectId(req.params.id),
                                },
                            },
                            {
                                $lookup: {
                                    from: "users",
                                    let: { user_id: "$user" },
                                    pipeline: [
                                        {
                                            $match: { $expr: { $eq: ["$_id", "$$user_id"] } },
                                        },
                                        { $project: { password: 0 } },
                                    ],
                                    as: "user",
                                },
                            },
                            { $unwind: "$user" },
                        ],
                        totalCount: [
                            {
                                $match: {
                                    user: new mongoose_1.default.Types.ObjectId(req.params.id),
                                },
                            },
                            { $count: "count" },
                        ],
                    },
                },
                {
                    $project: {
                        totalData: 1,
                        count: { $arrayElemAt: ["$totalCount.count", 0] },
                    },
                },
            ]);
            const blogs = Data[0].totalData;
            const count = Data[0].count;
            myCache.set(key, { blogs, count });
            res.json({ blogs, count });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    updateBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "Invalid Authentication 14" });
        try {
            const newBlog = req.body;
            const { classify } = req.body;
            let blog;
            if (classify.toLowerCase() === "create") {
                blog = yield blogModel_1.default.findOneAndUpdate({
                    _id: req.params.id,
                    user: req.user._id,
                }, newBlog);
                if (!blog)
                    return res.status(400).json({ msg: "Invalid Authentication 15" });
            }
            else if (classify.toLowerCase() === "draft") {
                blog = yield draftBlogsModel_1.default.findOneAndUpdate({
                    _id: req.params.id,
                    user: req.user._id,
                }, newBlog);
                if (!blog)
                    return res.status(400).json({ msg: "Invalid Authentication 16" });
            }
            res.json({ success: true, msg: "Update Blog successfully", blog });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    updateBookMarkBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "Invalid Authentication 17" });
        try {
            const newBlog = req.body;
            const { classify } = req.body;
            let blog;
            if (classify.toLowerCase() === "create") {
                blog = yield blogModel_1.default.findOneAndUpdate({
                    _id: req.params.id,
                    user: req.user._id,
                }, newBlog);
                if (!blog)
                    return res.status(400).json({ msg: "Invalid Authentication 18" });
            }
            else if (classify.toLowerCase() === "draft") {
                blog = yield draftBlogsModel_1.default.findOneAndUpdate({
                    _id: req.params.id,
                    user: req.user._id,
                }, newBlog);
                if (!blog)
                    return res.status(400).json({ msg: "Invalid Authentication 19" });
            }
            res.json({ success: true, msg: "Update Blog successfully", blog });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    deleteBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "Invalid Authentication 20" });
        let blog;
        try {
            blog = yield blogModel_1.default.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id,
            });
            if (!blog)
                return res.status(400).json({ msg: "Invalid Authentication 21" });
            res.json({ msg: "Delete Blog successfully", blog });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    deleteDraftBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "Invalid Authentication 22" });
        try {
            const blog = yield draftBlogsModel_1.default.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id,
            });
            if (!blog)
                return res.status(400).json({ msg: "Invalid Authentication 23" });
            res.json({ msg: "Delete Draft Blog successfully", blog });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
};
exports.default = blogCtrl;
