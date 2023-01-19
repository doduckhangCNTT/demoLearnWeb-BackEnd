"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const conversationModel_1 = __importDefault(require("../models/conversationModel"));
const messagesModel_1 = __importDefault(require("../models/messagesModel"));
const index_1 = require("../index");
const socket_1 = require("../config/socket");
class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    paginating() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 9;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}
const PageConfig = (req) => {
    const limit = Number(req.query.limit) * 1 || 9;
    const page = Number(req.query.page) * 1 || 1;
    const skip = (page - 1) * limit;
    return { limit, page, skip };
};
const messageCtrl = {
    createMessage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { sender, recipient, text, media } = req.body;
            const newConversation = yield conversationModel_1.default.findOneAndUpdate({
                $or: [
                    { recipients: [sender, recipient] },
                    { recipients: [recipient, sender] },
                ],
            }, {
                recipients: [sender, recipient],
                text,
                media,
            }, { new: true, upsert: true });
            const newMessage = new messagesModel_1.default({
                conversation: newConversation._id,
                sender,
                recipient,
                text,
                media,
            });
            const data = Object.assign(Object.assign({}, newMessage._doc), { sender: sender });
            // Socket
            const user = socket_1.usersActive.find((user) => user.id === recipient);
            user && index_1.io.to(`${user.socketId}`).emit("createMessage", data);
            yield newMessage.save();
            res.json(newMessage);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    getConversations: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "User need Login" });
        try {
            const conversations = yield conversationModel_1.default.find({
                recipients: req.user._id,
            }).populate("recipients");
            res.json({
                conversations,
                result: conversations.length,
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    getMessages: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user)
            return res.status(400).json({ msg: "User need Login" });
        const { limit, skip } = PageConfig(req);
        try {
            const messages = yield messagesModel_1.default.find({
                $or: [
                    { sender: req.user._id, recipient: req.params.recipientId },
                    { sender: req.params.recipientId, recipient: req.user._id },
                ],
            })
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate("sender recipient");
            res.json({
                messages,
                result: messages.length,
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
    deleteMessage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const message = yield messagesModel_1.default.findOneAndDelete({ _id: req.params.id });
            // Socket
            const user = socket_1.usersActive.find((user) => { var _a; return user.id === ((_a = message.recipient) === null || _a === void 0 ? void 0 : _a.toString()); });
            user && ((_a = index_1.io.to(`${user === null || user === void 0 ? void 0 : user.socketId}`)) === null || _a === void 0 ? void 0 : _a.emit("deleteMessage", message));
            res.json({ msg: "Delete successfully", message: message });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }),
};
exports.default = messageCtrl;
