import mongoose from "mongoose";
import { IUser } from "../config/interface";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add your name"],
      trim: true,
      maxLength: [20, "Your name is up to chars long"],
    },
    account: {
      type: String,
      required: [true, "Please add your email or phone"],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please add your password"],
    },
    avatar: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1611944212129-29977ae1398c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80",
    },
    bio: {
      type: String,
      default: "",
      maxLength: [100, "Bio is smaller than 100 characters"],
    },
    telephoneNumber: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      default: "user",
    },
    type: {
      type: String,
      default: "register",
    },
    rf_token: { type: String, select: true },

    // Danh sách các khóa học người dùng đã đăng kí
    courses: [
      {
        /**Thông tin khóa học */
        course: { type: mongoose.Types.ObjectId, ref: "courses" },
        /**Tiến bài học của người dùng */
        progressLesson: { type: Number, default: 0 },
        lessonId: { type: String },
        /**
         * Mục đích là lưu lại các bài học mà người dùng đã học và trạng thái hoàn thành quiz của bài học đó
         */
        lessons: [
          {
            lessonId: String,
            quiz: {
              quizId: { type: String, ref: "quickTests" },
              completed: Boolean,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("users", userSchema);
