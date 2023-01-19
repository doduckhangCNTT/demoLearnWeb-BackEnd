import express from "express";
import roomChatCtrl from "../../controllers/roomChat/roomChatCtrl";
import authUser from "../../middleware/auth/authUser";

const router = express.Router();

router.post("/roomChat", authUser, roomChatCtrl.createRoomChat);

router.get("/roomChats", authUser, roomChatCtrl.getRoomChats);

router.get("/roomChat/:id", authUser, roomChatCtrl.getRoomChat);

router.patch(
  "/add_user/roomChat/:roomId",
  authUser,
  roomChatCtrl.addUserRoomChat
);

router.patch(
  "/add_userAdmin/roomChat/:roomId",
  authUser,
  roomChatCtrl.addUserAdminRoomChat
);

router.patch(
  "/remove_user/roomChat/:roomId",
  authUser,
  roomChatCtrl.deleteUserRoomChat
);

router.patch(
  "/remove_userAdmin/roomChat/:roomId",
  authUser,
  roomChatCtrl.deleteUserAdminRoomChat
);

router
  .route("/roomChat/:id")
  .patch(authUser, roomChatCtrl.updateRoomChat)
  .delete(authUser, roomChatCtrl.deleteRoomChat);

export default router;
