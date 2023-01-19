"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const courseSchema = new mongoose_1.default.Schema({
    user: { type: mongoose_1.default.Types.ObjectId, ref: "users" },
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 20,
    },
    thumbnail: { type: Object, required: true },
    description: { type: String, minLength: 5 },
    accessModifier: { type: String, default: "private" },
    category: { type: mongoose_1.default.Types.ObjectId, ref: "categories" },
    videoIntro: { type: String, trim: true },
    format: { type: String, trim: true, default: "free course" },
    price: { type: Number, trim: true },
    oldPrice: { type: Number, trim: true },
    content: [
        {
            name: String,
            lessons: [
                {
                    name: String,
                    url: String || File,
                    // fileUpload: {
                    //   public_id: String,
                    //   secure_url: String,
                    //   mimetype: String,
                    // },
                    fileUpload: Object,
                    description: String,
                },
            ],
        },
    ],
}, { timestamps: true });
exports.default = mongoose_1.default.model("courses", courseSchema);
