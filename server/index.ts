import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import routes from "./routes";
const fileUpload = require("express-fileupload");

import { Server, Socket } from "socket.io";
import { createServer } from "http";
import { SocketServer } from "./config/socket";

// Middleware
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors({ origin: `${process.env.BASE_URL}`, credentials: true }));
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// ---------------- Setup Socket ----------------------
const http = createServer(app);
export const io = new Server(http, {
  cors: { origin: `${process.env.BASE_URL}`, credentials: true },
  // cors: { origin: "http://localhost:3000" },
});

io.on("connection", (socket: Socket) => SocketServer(socket));

// ------------------ Routes --------------------------
app.use("/api", routes);

// ------------------ Database ------------------------
import "./config/database";

// ------------------ Server Listening ----------------
const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log("Server listening on port ", PORT);
});
