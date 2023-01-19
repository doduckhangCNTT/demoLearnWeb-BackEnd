"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const draftBlogSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Types.ObjectId, ref: "users" },
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
    category: { type: mongoose_1.default.Types.ObjectId, ref: "categories" },
}, { timestamps: true });
exports.default = mongoose_1.default.model("draftBlogs", draftBlogSchema);
