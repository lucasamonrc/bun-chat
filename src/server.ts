import { randomBytes } from "node:crypto";
import Guest from "./guest";
import Room from "./room";
import Chat from "./chat";

Bun.listen<Guest>({
  hostname: "localhost",
  port: 8080,
  socket: {
    data(socket, data) {
      const chat = Chat.getInstance();
      const guest = socket.data;
      const packet = data.toString().trim();

      if (!guest.screenName) return chat.createScreenName(socket, packet);

      if (packet.startsWith("/join")) {
        const [, roomName] = packet.split(" ");
        return chat.joinRoom(socket, roomName);
      }

      if (packet.startsWith("/leave")) return chat.leaveRoom(socket);

      if (packet.startsWith("/list")) return chat.listRooms(socket);

      if (!!guest.room) return guest.room.broadcast(`${packet}\n`);

      socket.write(
        "You are not in a room! Join or create one with /join <room_name>\n"
      );
    },
    open(socket) {
      const chat = Chat.getInstance();

      socket.data = {
        sid: randomBytes(4).toString("hex"),
      };

      chat.guests[socket.data.sid] = socket;

      socket.write(
        `Welcome to BunChat!\nYour session ID is ${socket.data.sid}\nPlease enter your screen name: `
      );
    },
    close(socket) {
      const chat = Chat.getInstance();
      const guest = socket.data;

      if (guest.room) {
        guest.room.leave(guest.sid);
        guest.room = undefined;
      }

      delete chat.guests[guest.sid];

      socket.write("Goodbye!\n");
    },
  },
});
