"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const categorySchema = new mongoose_1.default.Schema({
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
}, { timestamps: true });
exports.default = mongoose_1.default.model("categories", categorySchema);
