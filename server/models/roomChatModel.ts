import mongoose from "mongoose";

const RoomChatModel = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      trim: true,
      minLength: 5,
      maxLength: 20,
    },
    admin: [{ type: mongoose.Types.ObjectId, ref: "users" }],
    users: [{ type: mongoose.Types.ObjectId, ref: "users" }],
    text: String,
    media: Array,
    call: Object,
  },
  { timestamps: true }
);

export default mongoose.model("roomsChat", RoomChatModel);
