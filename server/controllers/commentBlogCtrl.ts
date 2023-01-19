import { Response } from "express";
import mongoose from "mongoose";
import { IReqAuth } from "../config/interface";
import ReplyCommentBlogModel from "../models/replyCommentBlogModel";
import CommentBlog from "../models/commentBlogModel";
import { io } from "../index";

const commentBlogCtrl = {
  createCommentBlog: async (req: IReqAuth, res: Response) => {
    try {
      const { content, blog_id, blog_of_userID } = req.body;
      const newCommentBlog = new CommentBlog({
        user: req.user?._id,
        content,
        blog_id,
        blog_of_userID,
      });

      const data = {
        ...newCommentBlog._doc,
        user: req.user,
        createdAt: new Date().toISOString(),
      };

      io.to(`${blog_id}`).emit("createCommentBlog", data);

      await newCommentBlog.save();
      res.json({
        success: true,
        msg: "Created comment Blog successfully",
        newCommentBlog,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getCommentsBlog: async (req: IReqAuth, res: Response) => {
    try {
      const Data = await CommentBlog.aggregate([
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateCommentBlog: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res.status(400).json({ msg: "Invalid Authentication 28" });
    }

    try {
      const comment = await CommentBlog.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user?.id,
        },
        { content: req.body?.content },
        { new: true }
      );
      if (!comment)
        return res.status(400).json({ msg: "Comment not found 29" });

      io.to(`${comment.blog_id}`).emit("updateCommentBlog", comment);

      res.json(comment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteCommentBlog: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res.status(400).json({ msg: "Invalid Authentication 30" });
    }

    try {
      const comment = await CommentBlog.findOneAndDelete({
        _id: req.params.id,
        // user: req.user?.id,
      });

      if (!comment) return res.status(400).json({ msg: "Comment not found" });

      if (!(comment as any).rootComment_answeredId) {
        await ReplyCommentBlogModel.deleteMany({
          _id: { $in: (comment as any).reply_comment },
        });
      }

      io.to(`${comment.blog_id}`).emit("deleteCommentBlog", comment);

      res.json(comment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default commentBlogCtrl;
