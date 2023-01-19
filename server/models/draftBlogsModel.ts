import mongoose from "mongoose";

const draftBlogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "users" },

    title: {
      type: String,
      require: true,
      trim: true,
      minLength: 5,
      maxLength: 50,
    },

    content: {
      type: String,
      require: true,
      minLength: 1000,
    },

    description: {
      type: String,
      require: true,
      trim: true,
      minLength: 50,
      maxLength: 100,
    },

    thumbnail: {
      type: Object,
      require: true,
    },

    category: { type: mongoose.Types.ObjectId, ref: "categories" },
  },
  { timestamps: true }
);

export default mongoose.model("draftBlogs", draftBlogSchema);
