import mongoose from "mongoose";

const MessageRoomSchema = new mongoose.Schema(
  {
    roomChat: { type: mongoose.Types.ObjectId, ref: "roomsChat" },
    sender: { type: mongoose.Types.ObjectId, ref: "users" },
    // recipient: { type: mongoose.Types.ObjectId, ref: "roomsChat" },
    text: String,
    media: Array,
    call: Object,
  },
  { timestamps: true }
);

export default mongoose.model("messagesRoom", MessageRoomSchema);
