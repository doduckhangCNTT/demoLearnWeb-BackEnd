import { Response } from "express";
import { IReqAuth } from "../../config/interface";
import RoomChatModel from "../../models/roomChatModel";
import MessageRoomChatModel from "../../models/messagesRoomModel";
import { io } from "../../index";

const messageRoomChatCtrl = {
  createMessage: async (req: IReqAuth, res: Response) => {
    try {
      const { sender, roomId, text, media } = req.body;
      console.log("Room", { sender, text, media });

      const newMessage = await RoomChatModel.findOneAndUpdate(
        {
          _id: roomId,
        },
        { text, media },
        { new: true }
      );

      const message = new MessageRoomChatModel({
        roomChat: newMessage._id,
        sender,
        text,
        media,
      });

      const data = {
        ...message._doc,
        sender,
      };

      // Socket
      io.to(`${roomId}`).emit("createMessageRoom", data);

      await message.save();
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  },

  getMessages: async (req: IReqAuth, res: Response) => {
    try {
      const messages = await MessageRoomChatModel.find({
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
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  },

  deleteMessage: async (req: IReqAuth, res: Response) => {
    try {
      const { msgId, roomChatId } = req.params;

      const message = await MessageRoomChatModel.findOneAndDelete({
        _id: msgId,
      });
      console.log("Delete Msg: ", message);
      io.to(`${message.roomChat}`).emit("deleteMsg", message);

      res.json(message);
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  },

  deleteMessageRoom: async (req: IReqAuth, res: Response) => {
    try {
      const { roomId } = req.params;

      const message = await MessageRoomChatModel.deleteMany({
        roomChat: roomId,
      });
      console.log("Delete Msg: ", message);

      res.json(message);
    } catch (error: any) {
      res.status(500).json({ msg: error.message });
    }
  },
};

export default messageRoomChatCtrl;
