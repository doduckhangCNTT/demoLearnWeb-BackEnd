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
const replyCommentBlogModel_1 = __importDefault(require("../models/replyCommentBlogModel"));
const commentBlogModel_1 = __importDefault(require("../models/commentBlogModel"));
const index_1 = require("../index");
const commentBlogCtrl = {
    createCommentBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { content, blog_id, blog_of_userID } = req.body;
            const newCommentBlog = new commentBlogModel_1.default({
                user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                content,
                blog_id,
                blog_of_userID,
            });
            const data = Object.assign(Object.assign({}, newCommentBlog._doc), { user: req.user, createdAt: new Date().toISOString() });
            index_1.io.to(`${blog_id}`).emit("createCommentBlog", data);
            yield newCommentBlog.save();
            res.json({
                success: true,
                msg: "Created comment Blog successfully",
                newCommentBlog,
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    getCommentsBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const Data = yield commentBlogModel_1.default.aggregate([
                {
                    $facet: {
                        totalData: [
                            {
                                $match: {
                                    blog_id: new mongoose_1.default.Types.ObjectId(req.params.id),
                                },
                            },
                            {
                                $lookup: {
                                    from: "users",
                                    let: { user_id: "$user" },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ["$_id", "$$user_id"] } } },
                                        { $project: { password: 0, rf_token: 0 } },
                                    ],
                                    as: "user",
                                },
                            },
                            { $unwind: "$user" },
                            { $sort: { createdAt: -1 } },
                            {
                                $group: {
                                    _id: "$blog_id",
                                    userComment: { $first: "$user" },
                                    comments: { $push: "$$ROOT" },
                                    count: { $sum: 1 },
                                },
                            },
                        ],
                        totalCount: [],
                    },
                },
            ]);
            const comments = Data[0].totalData;
            res.json(comments);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    updateCommentBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        if (!req.user) {
            return res.status(400).json({ msg: "Invalid Authentication 28" });
        }
        try {
            const comment = yield commentBlogModel_1.default.findOneAndUpdate({
                _id: req.params.id,
                user: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
            }, { content: (_c = req.body) === null || _c === void 0 ? void 0 : _c.content }, { new: true });
            if (!comment)
                return res.status(400).json({ msg: "Comment not found 29" });
            index_1.io.to(`${comment.blog_id}`).emit("updateCommentBlog", comment);
            res.json(comment);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    deleteCommentBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res.status(400).json({ msg: "Invalid Authentication 30" });
        }
        try {
            const comment = yield commentBlogModel_1.default.findOneAndDelete({
                _id: req.params.id,
                // user: req.user?.id,
            });
            if (!comment)
                return res.status(400).json({ msg: "Comment not found" });
            if (!comment.rootComment_answeredId) {
                yield replyCommentBlogModel_1.default.deleteMany({
                    _id: { $in: comment.reply_comment },
                });
            }
            index_1.io.to(`${comment.blog_id}`).emit("deleteCommentBlog", comment);
            res.json(comment);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
};
exports.default = commentBlogCtrl;
