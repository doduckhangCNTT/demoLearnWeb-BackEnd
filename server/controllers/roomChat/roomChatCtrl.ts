import { Response } from "express";
import { io } from "../../index";
import { IReqAuth } from "../../config/interface";
import RoomChatModel from "../../models/roomChatModel";
import { usersActive } from "../../config/socket";

const roomChatCtrl = {
  createRoomChat: async (req: IReqAuth, res: Response) => {
    try {
      const { nameRoom, listUser } = req.body;
      // if (listUser.length <= 2)
      //   return res.status(400).json({ msg: "Quantity users not available" });

      listUser.push(req.user);
      const roomChat = new RoomChatModel({
        name: nameRoom,
        users: listUser,
        admin: req.user,
      });

      await roomChat.save();

      const data = {
        ...roomChat._doc,
        admin: [req.user],
        users: listUser,
      };

      console.log("Data: ", data);

      listUser.forEach((user: any) => {
        const userLive = usersActive.find(
          (userActive) => userActive.id === user._id
        );
        if (userLive) {
          io.to(`${userLive.socketId}`).emit("createRoom", data);
        }
      });

      res.json({ msg: "Create Room Chat successfully!", roomChat: data });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  },

  getRoomChats: async (req: IReqAuth, res: Response) => {
    try {
      const rooms = await RoomChatModel.find({
        users: { $elemMatch: { $eq: req.user?._id } },
      })
        .populate("users", "-password -rf_token")
        .populate("admin", "-password -rf_token");

      res.json(rooms);
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  },

  getRoomChat: async (req: IReqAuth, res: Response) => {
    try {
      const room = await RoomChatModel.findOne({
        _id: req.params.id,
      })
        .populate("admin", "-password -rf_token")
        .populate("users", "-password -rf_token");

      console.log("Room: ", room);
      res.json(room);
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  },

  addUserRoomChat: async (req: IReqAuth, res: Response) => {
    try {
      const { user } = req.body;
      const { roomId } = req.params;
      if (!user._id || !roomId)
        return res.status(400).json({ msg: "Need provided userId and roomId" });

      const usersInRoom = await RoomChatModel.findOneAndUpdate(
        {
          _id: roomId,
        },
        {
          $push: { users: user },
        },
        { new: true }
      )
        .populate("users", "-password -rf_token")
        .populate("admin", "-password -rf_token");

      if (!usersInRoom) return res.status(400).json({ msg: "Room not found" });
      res.json({ usersInRoom, user });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  },

  addUserAdminRoomChat: async (req: IReqAuth, res: Response) => {
    try {
      const { user } = req.body;
      const { roomId } = req.params;
      if (!user._id || !roomId)
        return res.status(400).json({ msg: "Need provided userId and roomId" });

      const adminsInRoom = await RoomChatModel.findOneAndUpdate(
        {
          _id: roomId,
        },
        {
          $push: { admin: user },
        },
        { new: true }
      )
        .populate("users", "-password -rf_token")
        .populate("admin", "-password -rf_token");

      if (!adminsInRoom) return res.status(400).json({ msg: "Room not found" });
      res.json({ adminsInRoom, user });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  },

  deleteUserRoomChat: async (req: IReqAuth, res: Response) => {
    try {
      const { user } = req.body;
      const { roomId } = req.params;
      if (!user._id || !roomId)
        return res.status(400).json({ msg: "Need provided userId and roomId" });

      const usersInRoom = await RoomChatModel.findOneAndUpdate(
        {
          _id: roomId,
        },
        {
          $pull: { users: user._id },
        },
        { new: true }
      )
        .populate("users", "-password -rf_token")
        .populate("admin", "-password -rf_token");

      if (!usersInRoom) return res.status(400).json({ msg: "Room not found" });
      res.json({ usersInRoom, user });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  },

  deleteUserAdminRoomChat: async (req: IReqAuth, res: Response) => {
    try {
      const { admin } = req.body;
      const { roomId } = req.params;
      if (!admin._id || !roomId)
        return res.status(400).json({ msg: "Need provided userId and roomId" });

      const adminsInRoom = await RoomChatModel.findOneAndUpdate(
        {
          _id: roomId,
        },
        {
          $pull: { admin: admin._id },
        },
        { new: true }
      )
        .populate("users", "-password -rf_token")
        .populate("admin", "-password -rf_token");

      if (!adminsInRoom) return res.status(400).json({ msg: "Room not found" });
      res.json({ adminsInRoom, admin });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateRoomChat: async (req: IReqAuth, res: Response) => {
    try {
      const { nameRoom } = req.body;

      const roomChat = await RoomChatModel.findOneAndUpdate(
        { _id: req.params.id },
        { name: nameRoom },
        { new: true }
      )
        .populate("users", "-password -rf_token")
        .populate("admin", "-password -rf_token");

      res.json({ msg: "Update Room Chat successfully", roomChat });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  },

  deleteRoomChat: async (req: IReqAuth, res: Response) => {
    try {
      // const { admin } = req.body;

      // if (admin._id !== req.user?._id)
      //   return res.status(400).json({ msg: "You aren't admin of Room Chat" });

      const roomChat = await RoomChatModel.findOneAndDelete({
        _id: req.params.id,
      });

      res.json({ msg: "Delete Room Chat successfully", roomChat });
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  },
};

export default roomChatCtrl;
