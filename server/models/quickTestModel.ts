import mongoose from "mongoose";
import { IQuickTests } from "../config/interface";

const quickTestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "users" },

    titleTest: {
      type: String,
      trim: true,
      required: true,
      minLength: 5,
      maxLength: 50,
    },

    category: { type: mongoose.Types.ObjectId, ref: "categories" },

    time: {
      type: Number,
    },

    description: {
      type: String,
      trim: true,
    },

    image: { type: Object, required: true },

    numberOfTimes: { type: Number, required: true },

    questions: [
      {
        titleQuestion: String,
        typeQuestion: String,
        answers: [{ content: String }],
        correctly: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IQuickTests>("quickTests", quickTestSchema);
