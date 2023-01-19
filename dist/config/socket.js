"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketServer = exports.usersActive = void 0;
exports.usersActive = [];
const SocketServer = (socket) => {
    console.log(socket.id + " connected");
    // ---------------------- Join User --------------------------------
    socket.on("joinUser", (id) => {
        exports.usersActive.push({ id, socketId: socket.id });
        console.log("usersActive: ", exports.usersActive);
    });
    // ---------------------- Room --------------------------------
    socket.on("joinRoom", (id) => {
        socket.join(id);
        console.log("Room Join: ", socket.adapter.rooms);
    });
    socket.on("outRoom", (id) => {
        socket.leave(id);
        console.log("Out Room Join: ", socket.adapter.rooms);
    });
    // ---------------------- Disconnect --------------------------------
    socket.on("disconnect", () => {
        console.log(socket.id + " disconnected");
        exports.usersActive = exports.usersActive.filter((user) => user.socketId !== socket.id);
        console.log("usersActive: ", exports.usersActive);
    });
};
exports.SocketServer = SocketServer;
