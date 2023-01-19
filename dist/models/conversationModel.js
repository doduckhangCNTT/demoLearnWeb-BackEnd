"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ConversationSchema = new mongoose_1.default.Schema({
    recipients: [{ type: mongoose_1.default.Types.ObjectId, ref: "users" }],
    text: String,
    media: Array,
    call: Object,
}, { timestamps: true });
exports.default = mongoose_1.default.model("conversations", ConversationSchema);
