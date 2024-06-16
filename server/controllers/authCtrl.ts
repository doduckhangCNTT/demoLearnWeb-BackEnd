import { Request, Response } from "express";
import Users from "../models/userModel";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateActiveToken,
  generateRefreshToken,
} from "../config/generateToken";
import { validEmail, validPhone } from "../middleware/valid";
import sendEmail from "../config/sendMail";
import jwt from "jsonwebtoken";
import {
  IDecodedToken,
  IFaceBookPayLoad,
  IGooglePayLoad,
  IReqAuth,
  IUser,
  IUserParams,
} from "../config/interface";
import { OAuth2Client } from "google-auth-library";
import fetch from "node-fetch";
import { sendSms, smsOTP, smsVerify } from "../config/sendSMS";

const client = new OAuth2Client(process.env.MAIL_CLIENT_ID);

const authCtrl = {
  register: async (req: Request, res: Response) => {
    try {
      const { name, account, password } = req.body;
      if (!name || !account || !password) {
        return res.json({ success: false, msg: "Invalid information" });
      }
      const user = await Users.findOne({ account });
      if (user) {
        return res.json({ success: false, msg: "User already exists" });
      }
      const passwordHash = await bcrypt.hash(password, 12);
      const newUser = { name, account, password: passwordHash };

      // Tao accesstoken
      const access_token = generateActiveToken({ newUser });

      const url = `${process.env.BASE_URL}/active/${access_token}`;
      console.log("Url: ", url);

      // Check register with pass or phone
      if (validEmail(account)) {
        await sendEmail(account, url, "Verify your email");
        return res.json({
          success: true,
          access_token,
          msg: "Please check your email.",
        });
      } else if (validPhone(account)) {
        sendSms(account, url, " Access Learn Web ");
        return res.json({
          success: true,
          access_token,
          msg: "Please check your phone.",
        });
      }
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { account, password } = req.body;
      if (!account || !password) {
        return res.json({ success: false, msg: "Invalid information" });
      }
      if (!validEmail(account)) {
        return res.json({ success: false, msg: "Email incorrect format" });
      }
      const user = await Users.findOne({ account });
      if (!user) {
        return res.json({ success: false, msg: "User not found" });
      }

      loginUser(user, password, res);
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  },

  logout: async (req: IReqAuth, res: Response) => {
    if (!req.user)
      return res
        .status(400)
        .json({ success: false, msg: "Invalid Authentication 11" });
    try {
      res.clearCookie("refreshtoken", { path: "/api/refresh_token" });
      await Users.findOneAndUpdate({ _id: req.user?._id }, { rf_token: "" });

      res.json({ success: true, msg: "Logged out" });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  },

  refreshToken: async (req: IReqAuth, res: Response) => {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token) {
        return res.json({
          success: false,
          msg: "You need Login or Register to watch courses, quickTest ...",
        });
      }

      const decoded = <IDecodedToken>(
        jwt.verify(rf_token, `${process.env.REFRESH_TOKEN_SECRET}`)
      );
      if (!decoded.id) {
        return res
          .status(400)
          .json({ success: false, msg: "You need Login or Register 2" });
      }

      const user = await Users.findById(decoded.id).select(
        "-password +rf_token"
      );
      if (!user) {
        return res.status(400).json({ success: false, msg: "User not found" });
      }

      const access_token = generateAccessToken({ id: user._id });
      const refresh_token = generateRefreshToken({ id: user._id }, res);

      await Users.findOneAndUpdate(
        { _id: user._id },
        { rf_token: refresh_token }
      );

      res.json({
        success: true,
        msg: "Refresh token was successfully",
        user,
        access_token,
        refresh_token,
      });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  },

  activeAccount: async (req: Request, res: Response) => {
    try {
      const { active_token } = req.body;
      const decoded = <IDecodedToken>(
        jwt.verify(active_token, `${process.env.ACTIVE_TOKEN_SECRET}`)
      );
      const { newUser } = decoded;
      if (!newUser) {
        return res
          .status(400)
          .json({ success: false, msg: "Invalid Authentication 12" });
      }
      const user = await Users.findOne({ account: newUser.account });
      if (user) {
        return res
          .status(400)
          .json({ success: false, msg: "User already exists" });
      }
      const new_user = new Users(newUser);
      await new_user.save();
      res.json({ success: true, msg: "Register successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  googleAccount: async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const verify = await client.verifyIdToken({
        idToken: token,
        audience: process.env.MAIL_CLIENT_ID,
      });
      const { email, email_verified, name, picture } = <IGooglePayLoad>(
        verify?.getPayload()
      );
      if (!email_verified)
        return res.status(400).json({ msg: "Email is not verified" });
      const password = email + "You secret your account";
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await Users.findOne({ account: email });
      if (user) {
        loginUser(user, password, res);
      } else {
        const newUser = {
          name,
          account: email,
          password: passwordHash,
          avatar: picture,
          type: "google",
        };
        registerUser(newUser, res);
      }
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  facebookAccount: async (req: Request, res: Response) => {
    try {
      const { userID, accessToken } = req.body;
      // truy cập để lấy path https://developers.facebook.com/docs/graph-api/overview/
      const URL = `https://graph.facebook.com/v4.0/${userID}/?fields=id,name,email,picture&access_token=${accessToken}`;
      const data = await fetch(URL)
        .then((res) => res.json())
        .then((res) => {
          return res;
        });
      const { email, name, picture } = <IFaceBookPayLoad>data;
      const avatar = picture.data.url;
      const password = email + "You secret your account";
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await Users.findOne({ account: email });

      if (user) {
        loginUser(user, password, res);
      } else {
        const newUser = {
          name,
          account: email,
          password: passwordHash,
          avatar,
          type: "facebook",
        };
        registerUser(newUser, res);
      }
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  loginSmsAccount: async (req: Request, res: Response) => {
    try {
      const { phone } = req.body;
      const data = await smsOTP(phone, "sms");
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  verifySmsAccount: async (req: Request, res: Response) => {
    try {
      const { phone, code } = req.body;
      const data = await smsVerify(phone, code);
      if (!data?.valid)
        return res.status(400).json({ msg: "Invalid Authentication 13" });

      const password = phone + "You secret your account";
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await Users.findOne({ account: phone });

      if (user) {
        loginUser(user, password, res);
      } else {
        const newUser = {
          name: phone,
          account: phone,
          password: passwordHash,
          type: "login",
        };
        registerUser(newUser, res);
      }
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },

  forgotPasswordAccount: async (req: Request, res: Response) => {
    try {
      const { account } = req.body;
      if (!account)
        return res
          .status(400)
          .json({ success: false, msg: "Invalid account." });

      const user = await Users.findOne({ account });
      if (!user)
        return res
          .status(400)
          .json({ success: false, msg: "You need to login or register." });

      const access_token = generateAccessToken({ id: user._id });
      const url = `${process.env.BASE_URL}/reset_password/${access_token}`;

      if (validEmail(account)) {
        sendEmail(account, url, "Forgot password your email");
        return res.json({
          success: true,
          access_token,
          msg: "Please check your email.",
        });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, msg: error.message });
    }
  },
};

/**
 * account: hamadahiro268@gmail.com
 * password: 12345678@Abc
 */

const loginUser = async (user: IUser, password: string, res: Response) => {
  if (!user) return res.json({ success: false, msg: "User don't exist" });

  const check = await bcrypt.compare(password, user.password);
  if (!check)
    return res.json({ success: false, msg: "User password mismatch" });

  const access_token = generateAccessToken({ id: user._id });
  const refresh_token = generateRefreshToken({ id: user._id }, res);

  if (refresh_token) {
    await Users.findOneAndUpdate(
      { _id: user._id },
      { rf_token: refresh_token }
    );
  }

  res.json({
    success: true,
    msg: "Login successful",
    access_token,
    refresh_token,
    user: { ...user._doc, password: "" },
  });
};

const registerUser = async (user: IUserParams, res: Response) => {
  const newUser = new Users(user);
  if (!newUser) return {};

  const access_token = generateAccessToken({ id: newUser._id });
  const refresh_token = generateRefreshToken({ id: newUser._id }, res);

  res.cookie("refreshtoken", refresh_token, {
    httpOnly: true,
    path: "/api/refresh_token",
    maxAge: 3600 * 24 * 60 * 60 * 1000, // 30 day
  });

  newUser.rf_token = refresh_token;
  await newUser.save();

  res.json({
    success: true,
    msg: "Login successful",
    access_token,
    refresh_token,
    user: { ...newUser._doc, password: "" },
  });
};

export default authCtrl;
