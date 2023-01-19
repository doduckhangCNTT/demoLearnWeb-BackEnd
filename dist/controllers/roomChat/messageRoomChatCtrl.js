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
const roomChatModel_1 = __importDefault(require("../../models/roomChatModel"));
const messagesRoomModel_1 = __importDefault(require("../../models/messagesRoomModel"));
const index_1 = require("../../index");
const messageRoomChatCtrl = {
    createMessage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { sender, roomId, text, media } = req.body;
            console.log("Room", { sender, text, media });
            const newMessage = yield roomChatModel_1.default.findOneAndUpdate({
                _id: roomId,
            }, { text, media }, { new: true });
            const message = new messagesRoomModel_1.default({
                roomChat: newMessage._id,
                sender,
                text,
                media,
            });
            const data = Object.assign(Object.assign({}, message._doc), { sender });
            // Socket
            index_1.io.to(`${roomId}`).emit("createMessageRoom", data);
            yield message.save();
            res.json(message);
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
    getMessages: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const messages = yield messagesRoomModel_1.default.find({
                roomChat: req.params.roomId,
            })
                .populate("sender", "-password -rf_token")
                .populate("roomChat")
                .populate({
                path: "roomChat",
                populate: { path: "users" },
            })
                .populate({
                path: "roomChat",
                populate: { path: "admin" },
            });
            res.json(messages);
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
    deleteMessage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { msgId, roomChatId } = req.params;
            const message = yield messagesRoomModel_1.default.findOneAndDelete({
                _id: msgId,
            });
            console.log("Delete Msg: ", message);
            index_1.io.to(`${message.roomChat}`).emit("deleteMsg", message);
            res.json(message);
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
    deleteMessageRoom: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { roomId } = req.params;
            const message = yield messagesRoomModel_1.default.deleteMany({
                roomChat: roomId,
            });
            console.log("Delete Msg: ", message);
            res.json(message);
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
};
exports.default = messageRoomChatCtrl;
