import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    recipients: [{ type: mongoose.Types.ObjectId, ref: "users" }],
    text: String,
    media: Array,
    call: Object,
  },
  { timestamps: true }
);

export default mongoose.model("conversations", ConversationSchema);
