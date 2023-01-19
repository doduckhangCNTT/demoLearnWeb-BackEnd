import { Request } from "express";
import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  account: string;
  password: string;
  avatar: string;
  role: string;
  type: string;
  rf_token: string;
  _doc: object;
}

export interface IReqAuth extends Request {
  user?: IUser;
  files?: any;
}

export interface INewUser {
  name: string;
  account: string;
  password: string;
}

export interface IComment extends Document {
  user: string;
  blog_id: string;
  blog_user_id: string;
  content: string;
  replyCM: string[];
  reply_user: string;
  comment_root: string;
  _doc: object;
}
export interface IReplyCommentBlog extends Document {
  user: string;
  blog_id: string;
  blog_user_id: string;
  content: string;
  replyCM: string[];
  reply_user: string;
  rootComment_answeredId: string;
  _doc: object;
}

export interface IBlog {
  _id?: string;
  user: string | IUser;
  title: string;
  content: string;
  description: string;
  count?: number;
  // thumbnail: string | File;
  thumbnail: {
    url: string | File;
    public_id: string;
  };

  category: string;
  createdAt: string;
}

export interface IDecodedToken {
  id?: string;
  newUser?: INewUser;
  iat: number;
  exp: number;
}

export interface IGooglePayLoad {
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
}
export interface IFaceBookPayLoad {
  id: string;
  email: string;
  name: string;
  picture: any;
}

export interface IUserParams {
  name: string;
  account: string;
  password: string;
  avatar?: string;
  type: string;
}

export interface IQuickTests {
  user: string | IUser;
  titleTest: string;
  category: string;
  time: number;
  description: string;
  image: { url: string | File; public_id: string };
  numberOfTimes: number;
  questions: [
    {
      titleQuestion: string;
      typeQuestion: string;
      correctly: string;
      answers: [{ content: string }];
    }
  ];
}

export interface ICourses {
  _doc?: object;
  user: string | IUser;
  name: string;
  thumbnail: {
    url: string | File;
    public_id: string;
  };
  description: string;
  accessModifier: string;
  category: string;
  videoIntro: string;
  format: string;
  price: Number;
  oldPrice: Number;
  content: [
    {
      name: String;
      lessons: [
        name: String,
        url: String | File,
        fileUpload: { public_id: String; secure_url: String },
        description: String
      ];
      _id?: string;
      _doc?: object;
    }
  ];
}
