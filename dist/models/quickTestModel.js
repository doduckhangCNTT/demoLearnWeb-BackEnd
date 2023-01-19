"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const quickTestSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Types.ObjectId, ref: "users" },
    titleTest: {
        type: String,
        trim: true,
        required: true,
        minLength: 5,
        maxLength: 50,
    },
    category: { type: mongoose_1.default.Types.ObjectId, ref: "categories" },
    time: {
        type: Number,
    },
    description: {
        type: String,
        trim: true,
    },
    image: { type: Object, required: true },
    numberOfTimes: { type: Number, required: true },
    questions: [
        {
            titleQuestion: String,
            typeQuestion: String,
            answers: [{ content: String }],
            correctly: String,
        },
    ],
}, { timestamps: true });
exports.default = mongoose_1.default.model("quickTests", quickTestSchema);
