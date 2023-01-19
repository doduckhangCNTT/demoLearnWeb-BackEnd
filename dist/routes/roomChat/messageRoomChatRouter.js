"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messageRoomChatCtrl_1 = __importDefault(require("../../controllers/roomChat/messageRoomChatCtrl"));
const authUser_1 = __importDefault(require("../../middleware/auth/authUser"));
const router = express_1.default.Router();
router.get("/message/roomChat/:roomId", authUser_1.default, messageRoomChatCtrl_1.default.getMessages);
router.post("/message/roomChat", authUser_1.default, messageRoomChatCtrl_1.default.createMessage);
router.delete("/message/roomChat/:msgId", authUser_1.default, messageRoomChatCtrl_1.default.deleteMessage);
router
    .route("/messages/roomChat/:roomId")
    .delete(authUser_1.default, messageRoomChatCtrl_1.default.deleteMessageRoom);
exports.default = router;
