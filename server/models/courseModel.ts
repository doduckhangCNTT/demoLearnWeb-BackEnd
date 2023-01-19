import mongoose from "mongoose";
import { ICourses } from "../config/interface";

const courseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "users" },

    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 20,
    },

    thumbnail: { type: Object, required: true },

    description: { type: String, minLength: 5 },

    accessModifier: { type: String, default: "private" },

    category: { type: mongoose.Types.ObjectId, ref: "categories" },

    videoIntro: { type: String, trim: true },

    format: { type: String, trim: true, default: "free course" },

    price: { type: Number, trim: true },

    oldPrice: { type: Number, trim: true },

    content: [
      {
        name: String,
        lessons: [
          {
            name: String,
            url: String || File,
            // fileUpload: {
            //   public_id: String,
            //   secure_url: String,
            //   mimetype: String,
            // },
            fileUpload: Object,
            description: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ICourses>("courses", courseSchema);
