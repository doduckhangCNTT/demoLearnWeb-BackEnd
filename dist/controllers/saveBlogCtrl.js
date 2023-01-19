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
const saveBlogModel_1 = __importDefault(require("../models/saveBlogModel"));
const saveBlogCtrl = {
    createBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res
                .status(400)
                .json({ success: false, error: "Initial Authentication " });
        try {
            const { title, content, description, thumbnail, category, user, _id } = req.body;
            const newBlog = new saveBlogModel_1.default({
                userSaved: req.user._id,
                user: user._id,
                id_blog: _id,
                title: title,
                content: content,
                description: description,
                thumbnail: thumbnail,
                category: category,
            });
            yield newBlog.save();
            res.json(Object.assign(Object.assign({}, newBlog._doc), { user: req.user, msg: "Save Blog successfully" }));
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    getBlogs: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // const blogs = await Blogs.find().sort("-createdAt");
            const blogs = yield saveBlogModel_1.default.aggregate([
                // {
                //   $lookup: {
                //     from: "users",
                //     let: { user_id: "$user" },
                //     pipeline: [
                //       { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                //       { $project: { password: 0 } },
                //     ],
                //     as: "user",
                //   },
                // },
                // { $unwind: "$user" },
                {
                    $lookup: {
                        from: "users",
                        let: { user_id: "$userSaved" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                            { $project: { password: 0 } },
                        ],
                        as: "userSaved",
                    },
                },
                { $unwind: "$userSaved" },
                // {
                //   $lookup: {
                //     from: "categories",
                //     let: { category_id: "$category" },
                //     pipeline: [
                //       { $match: { $expr: { $eq: ["$_id", "$$category_id"] } } },
                //     ],
                //     as: "category",
                //   },
                // },
                // { $unwind: "$category" },
                { $sort: { createdAt: -1 } },
                {
                    $group: {
                        _id: "$userSaved._id",
                        userSaved: { $first: "$userSaved" },
                        blogs: { $push: "$$ROOT" },
                        count: { $sum: 1 },
                    },
                },
            ]);
            res.json(blogs);
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    getSaveBlogsUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const Data = yield saveBlogModel_1.default.aggregate([
                {
                    $facet: {
                        totalData: [
                            {
                                $match: {
                                    userSaved: new mongoose_1.default.Types.ObjectId(req.params.id),
                                },
                            },
                            { $sort: { createdAt: -1 } },
                        ],
                        totalCount: [
                            {
                                $match: {
                                    userSaved: new mongoose_1.default.Types.ObjectId(req.params.id),
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
            const blogsSave = Data[0].totalData;
            const count = Data[0].count;
            res.json({ blogsSave, count });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }),
    deleteBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "Invalid Authentication 123" });
        try {
            const blog = yield saveBlogModel_1.default.findOneAndDelete({
                _id: req.params.id,
                userSaved: req.user._id,
            });
            if (!blog)
                return res.status(400).json({ msg: "Invalid Authentication 1234" });
            res.json({ msg: "Delete Blog successfully", blog });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
};
exports.default = saveBlogCtrl;
