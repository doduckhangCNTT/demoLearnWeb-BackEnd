"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roomChatCtrl_1 = __importDefault(require("../../controllers/roomChat/roomChatCtrl"));
const authUser_1 = __importDefault(require("../../middleware/auth/authUser"));
const router = express_1.default.Router();
router.post("/roomChat", authUser_1.default, roomChatCtrl_1.default.createRoomChat);
router.get("/roomChats", authUser_1.default, roomChatCtrl_1.default.getRoomChats);
router.get("/roomChat/:id", authUser_1.default, roomChatCtrl_1.default.getRoomChat);
router.patch("/add_user/roomChat/:roomId", authUser_1.default, roomChatCtrl_1.default.addUserRoomChat);
router.patch("/add_userAdmin/roomChat/:roomId", authUser_1.default, roomChatCtrl_1.default.addUserAdminRoomChat);
router.patch("/remove_user/roomChat/:roomId", authUser_1.default, roomChatCtrl_1.default.deleteUserRoomChat);
router.patch("/remove_userAdmin/roomChat/:roomId", authUser_1.default, roomChatCtrl_1.default.deleteUserAdminRoomChat);
router
    .route("/roomChat/:id")
    .patch(authUser_1.default, roomChatCtrl_1.default.updateRoomChat)
    .delete(authUser_1.default, roomChatCtrl_1.default.deleteRoomChat);
exports.default = router;
