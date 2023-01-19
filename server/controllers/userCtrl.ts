import { Response } from "express";
import { IReqAuth, IUser } from "../config/interface";
import Users from "../models/userModel";
import bcrypt from "bcrypt";

const PageConfig = (req: IReqAuth) => {
  const page = Number(req.query.page) * 1 || 1;
  const limit = Number(req.query.limit) * 1 || 5;
  const skip = (page - 1) * limit;
  return { page, skip, limit };
};

function validateEmail(email?: string) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const userCtrl = {
  getUsers: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Authentication 1" });
    }
    try {
      const users = await Users.find().select("-password").sort("-createdAt");

      res.json({ users });
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  getUserSearch: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Authentication 2" });
    }
    try {
      const users = await Users.find({
        name: { $regex: req.query.username },
      })
        .limit(10)
        .select("-password")
        .sort("-createdAt");

      res.json({ users });
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  getUser: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Authentication 3" });
    }
    try {
      const user = await Users.findById(req.params.id).select("-password");
      if (!user)
        return res
          .status(400)
          .json({ success: false, msg: "Invalid Authentication 4" });

      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  getUsersPage: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Authentication 5" });
    }

    const { skip, limit } = PageConfig(req);

    try {
      const users = await Users.find();

      const usersPage = await Users.find()
        .skip(skip)
        .limit(limit)
        .select("-password")
        .sort("-createdAt");

      res.json({ users: usersPage, totalCount: users.length });
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  getUsersSearchPage: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Authentication 6" });
    }

    try {
      let users: IUser[] = [];
      const { search } = req.query;

      if (validateEmail(search ? search.toString() : "")) {
        users = await Users.find({ account: search });
      } else {
        if (search?.toString()?.match(/^[0-9a-fA-F]{24}$/)) {
          users = await Users.find({ _id: search });
        } else {
          users = [];
        }
      }
      if (users.length <= 0) {
        return res.json({ success: false, msg: "User not found" });
      }

      res.json({ success: true, users, totalCount: 1 });
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  updateUser: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Authentication 7" });
    }
    try {
      const { name, avatar, bio, telephoneNumber } = req.body;

      await Users.findOneAndUpdate(
        { _id: req.params.id },
        { name, avatar, bio, telephoneNumber }
      );

      res.json({ success: true, msg: "Updated user successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  updateOneComponentOfUser: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Authentication 8" });
    }
    try {
      const { name, user } = req.body;

      await Users.findOneAndUpdate(
        { _id: req.user?._id },
        { [`${name}`]: user[`${name}`] }
      );

      res.json({ success: true, msg: "Updated item successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  deleteUser: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Authentication 9" });
    }
    try {
      const user = await Users.findOneAndDelete({ _id: req.params.id });

      res.json({ success: true, user, msg: "Delete user successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  resetPassword: async (req: IReqAuth, res: Response) => {
    if (!req.user) return res.status(400).json({ msg: "User not found" });

    if (req.user.type !== "register") {
      return res.status(400).json({
        msg: `Quick login account with ${req.user.type} can't use this function`,
      });
    }
    try {
      const { password } = req.body;
      const passwordHash = await bcrypt.hash(password, 12);

      await Users.findOneAndUpdate(
        { _id: req.user._id },
        { password: passwordHash }
      );

      res.json({ success: true, msg: "Updated password is successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  uploadImg: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Authentication 10" });
    }
    try {
      const { url } = req.body;

      await Users.findOneAndUpdate({ _id: req.user._id }, { avatar: url });

      res.json({ success: true, msg: "Updated item successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },
};

export default userCtrl;
