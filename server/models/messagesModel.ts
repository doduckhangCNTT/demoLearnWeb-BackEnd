import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Types.ObjectId, ref: "conversations" },
    sender: { type: mongoose.Types.ObjectId, ref: "users" },
    recipient: { type: mongoose.Types.ObjectId, ref: "users" },
    text: String,
    media: Array,
    call: Object,
  },
  { timestamps: true }
);

export default mongoose.model("messages", MessageSchema);
