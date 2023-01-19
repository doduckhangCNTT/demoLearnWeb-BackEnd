"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messageCtrl_1 = __importDefault(require("../controllers/messageCtrl"));
const authUser_1 = __importDefault(require("../middleware/auth/authUser"));
const router = express_1.default.Router();
router.get("/messages/:recipientId", authUser_1.default, messageCtrl_1.default.getMessages);
router.post("/message", authUser_1.default, messageCtrl_1.default.createMessage);
router.get("/conversations", authUser_1.default, messageCtrl_1.default.getConversations);
router.route("/message/:id").delete(authUser_1.default, messageCtrl_1.default.deleteMessage);
exports.default = router;
