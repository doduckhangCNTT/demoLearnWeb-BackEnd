"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authRouter_1 = __importDefault(require("./authRouter"));
const userRouter_1 = __importDefault(require("./userRouter"));
const categoryRouter_1 = __importDefault(require("./categoryRouter"));
const cloudImgRouter_1 = __importDefault(require("./cloudImgRouter"));
const blogRouter_1 = __importDefault(require("./blogRouter"));
const saveBlogRouter_1 = __importDefault(require("./saveBlogRouter"));
const commentBlogRouter_1 = __importDefault(require("./commentBlogRouter"));
const replyCommentBlogRouter_1 = __importDefault(require("./replyCommentBlogRouter"));
const messageRouter_1 = __importDefault(require("./messageRouter"));
const roomChatRouter_1 = __importDefault(require("./roomChat/roomChatRouter"));
const messageRoomChatRouter_1 = __importDefault(require("./roomChat/messageRoomChatRouter"));
const quickTestRouter_1 = __importDefault(require("./quickTestRouter"));
const courseRouter_1 = __importDefault(require("./courseRouter"));
const routes = [
    authRouter_1.default,
    userRouter_1.default,
    categoryRouter_1.default,
    cloudImgRouter_1.default,
    blogRouter_1.default,
    saveBlogRouter_1.default,
    commentBlogRouter_1.default,
    replyCommentBlogRouter_1.default,
    messageRouter_1.default,
    messageRoomChatRouter_1.default,
    roomChatRouter_1.default,
    quickTestRouter_1.default,
    courseRouter_1.default,
];
exports.default = routes;
