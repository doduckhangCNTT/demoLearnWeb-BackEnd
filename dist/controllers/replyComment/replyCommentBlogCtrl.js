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
const replyCommentBlogModel_1 = __importDefault(require("../../models/replyCommentBlogModel"));
const commentBlogModel_1 = __importDefault(require("../../models/commentBlogModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("../../index");
const replyCommentsBlogCtrl = {
    createCommentReplyBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { content, blog_id, blog_of_userID, rootComment_answeredId, originCommentHightestId, reply_user, } = req.body;
            // console.log("Reply user: ", reply_user);
            const newReplyComment = new replyCommentBlogModel_1.default({
                user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                content,
                blog_id,
                blog_of_userID,
                originCommentHightestId,
                rootComment_answeredId,
                reply_user: reply_user._id,
            });
            // console.log("New Reply Comment: ", newReplyComment);
            yield replyCommentBlogModel_1.default.findOneAndUpdate({
                _id: rootComment_answeredId,
            }, {
                $push: { reply_comment: newReplyComment._id },
            });
            const comment = yield commentBlogModel_1.default.findOneAndUpdate({
                _id: originCommentHightestId || rootComment_answeredId,
            }, {
                $push: { reply_comment: newReplyComment._id },
            });
            const data = Object.assign(Object.assign({}, newReplyComment._doc), { user: req.user, idComment: comment === null || comment === void 0 ? void 0 : comment._id, createAt: new Date().toISOString() });
            index_1.io.to(`${blog_id}`).emit("replyCommentBlog", data);
            yield newReplyComment.save();
            res.json(newReplyComment);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    getCommentsReplyBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const Data = yield replyCommentBlogModel_1.default.aggregate([
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
                                    let: { reply_user_id: "$reply_user" },
                                    pipeline: [
                                        { $match: { $expr: { $eq: ["$_id", "$$reply_user_id"] } } },
                                        { $project: { password: 0 } },
                                    ],
                                    as: "reply_user",
                                },
                            },
                            { $unwind: "$reply_user" },
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
                                $group: {
                                    _id: "$blog_id",
                                    userReplyComment: { $first: "$user" },
                                    replyComments: { $push: "$$ROOT" },
                                    count: { $sum: 1 },
                                },
                            },
                        ],
                        totalCount: [],
                    },
                },
            ]);
            const replyComments = Data[0].totalData;
            res.json(replyComments);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    updateCommentReplyBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        if (!req.user) {
            return res.json({ msg: "Invalid Authentication 42" });
        }
        try {
            const replyComment = yield replyCommentBlogModel_1.default.findOneAndUpdate({
                _id: req.params.id,
            }, { content: (_b = req.body) === null || _b === void 0 ? void 0 : _b.content }, { new: true });
            if (!replyComment)
                return res.status(400).json({ msg: "ReplyComment not found" });
            // console.log("update reply: ", replyComment);
            index_1.io.to(`${replyComment.blog_id}`).emit("updateReplyCommentBlog", replyComment);
            res.json(replyComment);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    deleteCommentReplyBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const replyComment = yield replyCommentBlogModel_1.default.findOneAndDelete({
                _id: req.params.id,
            });
            if (!replyComment) {
                return res
                    .status(400)
                    .json({ success: false, msg: "ReplyComment not found" });
            }
            // Kiểm tra xem reply có reply khác trả lời ko
            if (replyComment.reply_comment) {
                yield replyCommentBlogModel_1.default.deleteMany({
                    _id: { $in: replyComment.reply_comment },
                });
                // Chưa hoàn thành việc xóa id của reply comment trên reply_comment của comment gốc
                yield commentBlogModel_1.default.findOneAndUpdate({ _id: replyComment === null || replyComment === void 0 ? void 0 : replyComment.rootComment_answeredId }, {
                    $pull: {
                        reply_comment: { $in: replyComment === null || replyComment === void 0 ? void 0 : replyComment.reply_comment },
                    },
                });
                // console.log("Type : ", typeof (replyComment as any)?.reply_comment[0]);
                // console.log("Check : ", (replyComment as any)?.reply_comment[0]);
            }
            const data = Object.assign(Object.assign({}, replyComment._doc), { idComment: replyComment.rootComment_answeredId });
            index_1.io.to(`${replyComment.blog_id}`).emit("deleteReplyCommentBlog", data);
            res.json(replyComment);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    deleteCommentRootBlog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        try {
            const comment = yield commentBlogModel_1.default.findOneAndUpdate({
                _id: req.params.id,
            }, { reply_comment: (_c = req.body) === null || _c === void 0 ? void 0 : _c.replyComment });
            if (!comment)
                return res.status(400).json({ msg: "Comment not found" });
            if (!comment) {
                return res
                    .status(400)
                    .json({ success: false, msg: "ReplyComment not found" });
            }
            res.json(comment);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
};
exports.default = replyCommentsBlogCtrl;
