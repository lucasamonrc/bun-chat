import { Socket } from "bun";
import Guest from "./guest";
import Room from "./room";

class Chat {
  private static instance: Chat | null = null;

  public guests: { [key: string]: Socket<Guest> };
  public rooms: { [key: string]: Room };

  private constructor() {
    this.guests = {};
    this.rooms = {};
  }

  public static getInstance(): Chat {
    if (Chat.instance === null) {
      Chat.instance = new Chat();
    }

    return Chat.instance;
  }

  public createScreenName(socket: Socket<Guest>, screenName: string) {
    socket.data.screenName = screenName;
    socket.write(`Hello, ${socket.data.screenName}!\n`);
    socket.write(
      "You are not in a room! Join or create one with /join <room_name>\n"
    );
  }

  public joinRoom(socket: Socket<Guest>, roomName: string) {
    const guest = socket.data;

    if (!roomName) {
      socket.write("Please specify a room name!\n");
      return;
    }

    if (!this.rooms[roomName]) {
      this.rooms[roomName] = new Room(roomName);
    }

    this.rooms[roomName].join(guest.sid);
    guest.room = this.rooms[roomName];
  }

  public leaveRoom(socket: Socket<Guest>) {
    const guest = socket.data;

    if (!guest.room) {
      socket.write("You are not in a room!\n");
      return;
    }

    guest.room?.leave(guest.sid);
    guest.room = undefined;
  }

  public listRooms(socket: Socket<Guest>) {
    if (Object.keys(this.rooms).length === 0) {
      socket.write("There are no rooms!\n");
      return;
    }

    socket.write("Rooms:\n");

    for (const roomName in this.rooms) {
      socket.write(`- ${roomName}\n`);
    }
  }
}

export default Chat;
