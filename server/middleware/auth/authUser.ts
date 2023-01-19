import { NextFunction, Response } from "express";
import { IDecodedToken, IReqAuth } from "../../config/interface";
import Users from "../../models/userModel";
import jwt from "jsonwebtoken";

const authUser = async (req: IReqAuth, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(400).json({ msg: "Invalid token 1" });

    const decoded = <IDecodedToken>(
      jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`)
    );
    if (!decoded) {
      return res.status(400).json({ msg: "Invalid token 2" });
    }

    const user = await Users.findOne({ _id: decoded.id }).select("-password");
    if (!user) return res.status(400).json({ msg: "This is not a valid user" });

    req.user = user;
    next();
  } catch (error: any) {
    res.status(500).json({ msg: error.message });
  }
};

export default authUser;
