import express from "express";
import messageRoomChatCtrl from "../../controllers/roomChat/messageRoomChatCtrl";
import authUser from "../../middleware/auth/authUser";

const router = express.Router();

router.get(
  "/message/roomChat/:roomId",
  authUser,
  messageRoomChatCtrl.getMessages
);

router.post("/message/roomChat", authUser, messageRoomChatCtrl.createMessage);

router.delete(
  "/message/roomChat/:msgId",
  authUser,
  messageRoomChatCtrl.deleteMessage
);

router
  .route("/messages/roomChat/:roomId")
  .delete(authUser, messageRoomChatCtrl.deleteMessageRoom);

export default router;
