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
const index_1 = require("../../index");
const roomChatModel_1 = __importDefault(require("../../models/roomChatModel"));
const socket_1 = require("../../config/socket");
const roomChatCtrl = {
    createRoomChat: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { nameRoom, listUser } = req.body;
            // if (listUser.length <= 2)
            //   return res.status(400).json({ msg: "Quantity users not available" });
            listUser.push(req.user);
            const roomChat = new roomChatModel_1.default({
                name: nameRoom,
                users: listUser,
                admin: req.user,
            });
            yield roomChat.save();
            const data = Object.assign(Object.assign({}, roomChat._doc), { admin: [req.user], users: listUser });
            console.log("Data: ", data);
            listUser.forEach((user) => {
                const userLive = socket_1.usersActive.find((userActive) => userActive.id === user._id);
                if (userLive) {
                    index_1.io.to(`${userLive.socketId}`).emit("createRoom", data);
                }
            });
            res.json({ msg: "Create Room Chat successfully!", roomChat: data });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
    getRoomChats: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const rooms = yield roomChatModel_1.default.find({
                users: { $elemMatch: { $eq: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id } },
            })
                .populate("users", "-password -rf_token")
                .populate("admin", "-password -rf_token");
            res.json(rooms);
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
    getRoomChat: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const room = yield roomChatModel_1.default.findOne({
                _id: req.params.id,
            })
                .populate("admin", "-password -rf_token")
                .populate("users", "-password -rf_token");
            console.log("Room: ", room);
            res.json(room);
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
    addUserRoomChat: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { user } = req.body;
            const { roomId } = req.params;
            if (!user._id || !roomId)
                return res.status(400).json({ msg: "Need provided userId and roomId" });
            const usersInRoom = yield roomChatModel_1.default.findOneAndUpdate({
                _id: roomId,
            }, {
                $push: { users: user },
            }, { new: true })
                .populate("users", "-password -rf_token")
                .populate("admin", "-password -rf_token");
            if (!usersInRoom)
                return res.status(400).json({ msg: "Room not found" });
            res.json({ usersInRoom, user });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
    addUserAdminRoomChat: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { user } = req.body;
            const { roomId } = req.params;
            if (!user._id || !roomId)
                return res.status(400).json({ msg: "Need provided userId and roomId" });
            const adminsInRoom = yield roomChatModel_1.default.findOneAndUpdate({
                _id: roomId,
            }, {
                $push: { admin: user },
            }, { new: true })
                .populate("users", "-password -rf_token")
                .populate("admin", "-password -rf_token");
            if (!adminsInRoom)
                return res.status(400).json({ msg: "Room not found" });
            res.json({ adminsInRoom, user });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
    deleteUserRoomChat: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { user } = req.body;
            const { roomId } = req.params;
            if (!user._id || !roomId)
                return res.status(400).json({ msg: "Need provided userId and roomId" });
            const usersInRoom = yield roomChatModel_1.default.findOneAndUpdate({
                _id: roomId,
            }, {
                $pull: { users: user._id },
            }, { new: true })
                .populate("users", "-password -rf_token")
                .populate("admin", "-password -rf_token");
            if (!usersInRoom)
                return res.status(400).json({ msg: "Room not found" });
            res.json({ usersInRoom, user });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
    deleteUserAdminRoomChat: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { admin } = req.body;
            const { roomId } = req.params;
            if (!admin._id || !roomId)
                return res.status(400).json({ msg: "Need provided userId and roomId" });
            const adminsInRoom = yield roomChatModel_1.default.findOneAndUpdate({
                _id: roomId,
            }, {
                $pull: { admin: admin._id },
            }, { new: true })
                .populate("users", "-password -rf_token")
                .populate("admin", "-password -rf_token");
            if (!adminsInRoom)
                return res.status(400).json({ msg: "Room not found" });
            res.json({ adminsInRoom, admin });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
    updateRoomChat: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { nameRoom } = req.body;
            const roomChat = yield roomChatModel_1.default.findOneAndUpdate({ _id: req.params.id }, { name: nameRoom }, { new: true })
                .populate("users", "-password -rf_token")
                .populate("admin", "-password -rf_token");
            res.json({ msg: "Update Room Chat successfully", roomChat });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
    deleteRoomChat: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // const { admin } = req.body;
            // if (admin._id !== req.user?._id)
            //   return res.status(400).json({ msg: "You aren't admin of Room Chat" });
            const roomChat = yield roomChatModel_1.default.findOneAndDelete({
                _id: req.params.id,
            });
            res.json({ msg: "Delete Room Chat successfully", roomChat });
        }
        catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }),
};
exports.default = roomChatCtrl;
