import { Response } from "express";
import { IReqAuth } from "../../config/interface";
import ReplyCommentBlogModel from "../../models/replyCommentBlogModel";
import CommentBlogModel from "../../models/commentBlogModel";
import mongoose from "mongoose";
import { io } from "../../index";

const replyCommentsBlogCtrl = {
  createCommentReplyBlog: async (req: IReqAuth, res: Response) => {
    try {
      const {
        content,
        blog_id,
        blog_of_userID,
        rootComment_answeredId,
        originCommentHightestId,
        reply_user,
      } = req.body;

      // console.log("Reply user: ", reply_user);
      const newReplyComment = new ReplyCommentBlogModel({
        user: req.user?._id,
        content,
        blog_id,
        blog_of_userID,

        originCommentHightestId,
        rootComment_answeredId,
        reply_user: reply_user._id,
      });

      // console.log("New Reply Comment: ", newReplyComment);

      await ReplyCommentBlogModel.findOneAndUpdate(
        {
          _id: rootComment_answeredId,
        },
        {
          $push: { reply_comment: newReplyComment._id },
        }
      );

      const comment = await CommentBlogModel.findOneAndUpdate(
        {
          _id: originCommentHightestId || rootComment_answeredId,
        },
        {
          $push: { reply_comment: newReplyComment._id },
        }
      );

      const data = {
        ...newReplyComment._doc,
        user: req.user,
        idComment: comment?._id,
        createAt: new Date().toISOString(),
      };

      io.to(`${blog_id}`).emit("replyCommentBlog", data);

      await newReplyComment.save();
      res.json(newReplyComment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getCommentsReplyBlog: async (req: IReqAuth, res: Response) => {
    try {
      const Data = await ReplyCommentBlogModel.aggregate([
        {
          $facet: {
            totalData: [
              {
                $match: {
                  blog_id: new mongoose.Types.ObjectId(req.params.id),
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateCommentReplyBlog: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res.json({ msg: "Invalid Authentication 42" });
    }

    try {
      const replyComment = await ReplyCommentBlogModel.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        { content: req.body?.content },
        { new: true }
      );

      if (!replyComment)
        return res.status(400).json({ msg: "ReplyComment not found" });

      // console.log("update reply: ", replyComment);
      io.to(`${replyComment.blog_id}`).emit(
        "updateReplyCommentBlog",
        replyComment
      );
      res.json(replyComment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteCommentReplyBlog: async (req: IReqAuth, res: Response) => {
    try {
      const replyComment = await ReplyCommentBlogModel.findOneAndDelete({
        _id: req.params.id,
      });

      if (!replyComment) {
        return res
          .status(400)
          .json({ success: false, msg: "ReplyComment not found" });
      }

      // Kiểm tra xem reply có reply khác trả lời ko

      if ((replyComment as any).reply_comment) {
        await ReplyCommentBlogModel.deleteMany({
          _id: { $in: (replyComment as any).reply_comment },
        });

        // Chưa hoàn thành việc xóa id của reply comment trên reply_comment của comment gốc
        await CommentBlogModel.findOneAndUpdate(
          { _id: (replyComment as any)?.rootComment_answeredId },
          {
            $pull: {
              reply_comment: { $in: (replyComment as any)?.reply_comment },
            },
          }
        );

        // console.log("Type : ", typeof (replyComment as any)?.reply_comment[0]);
        // console.log("Check : ", (replyComment as any)?.reply_comment[0]);
      }

      const data = {
        ...replyComment._doc,
        idComment: replyComment.rootComment_answeredId,
      };
      io.to(`${replyComment.blog_id}`).emit("deleteReplyCommentBlog", data);

      res.json(replyComment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteCommentRootBlog: async (req: IReqAuth, res: Response) => {
    try {
      const comment = await CommentBlogModel.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        { reply_comment: req.body?.replyComment }
      );

      if (!comment) return res.status(400).json({ msg: "Comment not found" });

      if (!comment) {
        return res
          .status(400)
          .json({ success: false, msg: "ReplyComment not found" });
      }

      res.json(comment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default replyCommentsBlogCtrl;
