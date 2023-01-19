import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add your Category"],
      trim: true,
      unique: true,
      maxLength: [50, "Category is not allowed to exceed 50 characters"],
    },
    quality: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("categories", categorySchema);
