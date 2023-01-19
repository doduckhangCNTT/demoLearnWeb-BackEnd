import { Socket } from "socket.io";

export let usersActive: any[] = [];

export const SocketServer = (socket: Socket) => {
  console.log(socket.id + " connected");

  // ---------------------- Join User --------------------------------
  socket.on("joinUser", (id) => {
    usersActive.push({ id, socketId: socket.id });
    console.log("usersActive: ", usersActive);
  });

  // ---------------------- Room --------------------------------
  socket.on("joinRoom", (id: string) => {
    socket.join(id);
    console.log("Room Join: ", (socket as any).adapter.rooms);
  });

  socket.on("outRoom", (id: string) => {
    socket.leave(id);
    console.log("Out Room Join: ", (socket as any).adapter.rooms);
  });

  // ---------------------- Disconnect --------------------------------
  socket.on("disconnect", () => {
    console.log(socket.id + " disconnected");

    usersActive = usersActive.filter((user) => user.socketId !== socket.id);
    console.log("usersActive: ", usersActive);
  });
};
