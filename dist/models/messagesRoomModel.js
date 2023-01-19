"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MessageRoomSchema = new mongoose_1.default.Schema({
    roomChat: { type: mongoose_1.default.Types.ObjectId, ref: "roomsChat" },
    sender: { type: mongoose_1.default.Types.ObjectId, ref: "users" },
    // recipient: { type: mongoose.Types.ObjectId, ref: "roomsChat" },
    text: String,
    media: Array,
    call: Object,
}, { timestamps: true });
exports.default = mongoose_1.default.model("messagesRoom", MessageRoomSchema);
