import { Request, Response } from "express";
import { IReqAuth } from "../config/interface";
import Categories from "../models/categoryModel";

const categoryCtrl = {
  getCategories: async (req: Request, res: Response) => {
    try {
      const categories = await Categories.find().sort("-createdAt");
      if (!categories) res.json({});
      res.json({ categories });
    } catch (error: any) {
      res.status(400).json({ msg: error.message });
    }
  },

  postCategory: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid Authentication 24" });
    }
    try {
      const { name } = req.body;
      if (!name)
        return res
          .status(404)
          .json({ success: false, msg: "Name not provided" });

      const newCategory = new Categories({ name });

      await newCategory.save();
      res.json({
        success: true,
        msg: "Category saved successfully",
        category: newCategory,
      });
    } catch (error: any) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateCategory: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid Authentication 25" });
    }
    try {
      const { name } = req.body;

      if (!name) return res.status(400).json({ msg: "Name not provided" });
      const category = await Categories.findOneAndUpdate(
        { _id: req.params.id },
        { name }
      );
      if (!category) {
        return res
          .status(400)
          .json({ success: false, msg: "Category is not exists" });
      }

      res.json({ success: true, msg: "Update category successfully" });
    } catch (error: any) {
      res.status(400).json({ msg: error.message });
    }
  },

  patchCategory: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid Authentication 26" });
    }
    try {
      const { quality } = req.body;

      const category = await Categories.findOneAndUpdate(
        { _id: req.params.id },
        { quality }
      );
      if (!category) {
        return res
          .status(400)
          .json({ success: false, msg: "Category is not exists" });
      }

      res.json({ success: true, msg: "Update category successfully" });
    } catch (error: any) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteCategory: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Authentication 27" });
    }
    try {
      const category = await Categories.findOneAndDelete({
        _id: req.params.id,
      });
      if (!category) {
        return res
          .status(400)
          .json({ success: false, msg: "Category is not exists" });
      }

      res.json({ success: true, msg: "Successfully deleted category" });
    } catch (error: any) {
      res.status(400).json({ msg: error.message });
    }
  },
};

export default categoryCtrl;
