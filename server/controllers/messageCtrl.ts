import { Request, Response } from "express";
import { IReqAuth } from "../config/interface";
import Conversations from "../models/conversationModel";
import Messages from "../models/messagesModel";
import { io } from "../index";
import { usersActive } from "../config/socket";

class APIfeatures {
  query: any;
  queryString: any;
  constructor(query: any, queryString: any) {
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

const PageConfig = (req: Request) => {
  const limit = Number(req.query.limit) * 1 || 9;
  const page = Number(req.query.page) * 1 || 1;
  const skip = (page - 1) * limit;

  return { limit, page, skip };
};

const messageCtrl = {
  createMessage: async (req: IReqAuth, res: Response) => {
    try {
      const { sender, recipient, text, media } = req.body;
      const newConversation = await Conversations.findOneAndUpdate(
        {
          $or: [
            { recipients: [sender, recipient] },
            { recipients: [recipient, sender] },
          ],
        },
        {
          recipients: [sender, recipient],
          text,
          media,
        },
        { new: true, upsert: true }
      );

      const newMessage = new Messages({
        conversation: newConversation._id,
        sender,
        recipient,
        text,
        media,
      });
      const data = { ...newMessage._doc, sender: sender };
      // Socket
      const user = usersActive.find((user) => user.id === recipient);
      user && io.to(`${user.socketId}`).emit("createMessage", data);

      await newMessage.save();

      res.json(newMessage);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getConversations: async (req: IReqAuth, res: Response) => {
    if (!req.user) return res.status(400).json({ msg: "User need Login" });

    try {
      const conversations = await Conversations.find({
        recipients: req.user._id,
      }).populate("recipients");

      res.json({
        conversations,
        result: conversations.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getMessages: async (req: IReqAuth, res: Response) => {
    if (!req.user) return res.status(400).json({ msg: "User need Login" });
    const { limit, skip } = PageConfig(req);
    try {
      const messages = await Messages.find({
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
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteMessage: async (req: IReqAuth, res: Response) => {
    try {
      const message = await Messages.findOneAndDelete({ _id: req.params.id });
      // Socket
      const user = usersActive.find(
        (user) => user.id === message.recipient?.toString()
      );
      user && io.to(`${user?.socketId}`)?.emit("deleteMessage", message);

      res.json({ msg: "Delete successfully", message: message });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default messageCtrl;
