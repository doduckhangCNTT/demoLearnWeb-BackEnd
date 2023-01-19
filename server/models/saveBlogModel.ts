import mongoose from "mongoose";

const saveBlogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "users" },
    userSaved: { type: mongoose.Types.ObjectId, ref: "users" },

    id_blog: {
      type: String,
      require: true,
    },

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
      minLength: 10,
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

export default mongoose.model("saveBlogs", saveBlogSchema);
