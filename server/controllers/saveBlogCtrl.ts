import { Request, Response } from "express";
import mongoose from "mongoose";
import { IReqAuth } from "../config/interface";
import SaveBlogModel from "../models/saveBlogModel";

const saveBlogCtrl = {
  createBlog: async (req: IReqAuth, res: Response) => {
    if (!req.user)
      return res
        .status(400)
        .json({ success: false, error: "Initial Authentication " });
    try {
      const { title, content, description, thumbnail, category, user, _id } =
        req.body;
      const newBlog = new SaveBlogModel({
        userSaved: req.user._id,
        user: user._id,
        id_blog: _id,
        title: title,
        content: content,
        description: description,
        thumbnail: thumbnail,
        category: category,
      });
      await newBlog.save();

      res.json({
        ...newBlog._doc,
        user: req.user,
        msg: "Save Blog successfully",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getBlogs: async (req: Request, res: Response) => {
    try {
      // const blogs = await Blogs.find().sort("-createdAt");
      const blogs = await SaveBlogModel.aggregate([
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
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  getSaveBlogsUser: async (req: IReqAuth, res: Response) => {
    try {
      const Data = await SaveBlogModel.aggregate([
        {
          $facet: {
            totalData: [
              {
                $match: {
                  userSaved: new mongoose.Types.ObjectId(req.params.id),
                },
              },
              { $sort: { createdAt: -1 } },
            ],
            totalCount: [
              {
                $match: {
                  userSaved: new mongoose.Types.ObjectId(req.params.id),
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
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  deleteBlog: async (req: IReqAuth, res: Response) => {
    if (!req.user)
      return res.status(400).json({ msg: "Invalid Authentication 123" });

    try {
      const blog = await SaveBlogModel.findOneAndDelete({
        _id: req.params.id,
        userSaved: req.user._id,
      });
      if (!blog)
        return res.status(400).json({ msg: "Invalid Authentication 1234" });

      res.json({ msg: "Delete Blog successfully", blog });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default saveBlogCtrl;
