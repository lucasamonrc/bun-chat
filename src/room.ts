import Chat from "./chat";

class Room {
  private chat = Chat.getInstance();

  public guests: string[];
  public name: string;

  constructor(name: string) {
    this.guests = [];
    this.name = name;
  }

  public join(sid: string) {
    this.guests.push(sid);
    const screenName = this.chat.guests[sid].data.screenName;
    this.broadcast(`${screenName} has joined the room!\n`);
  }

  public leave(sid: string) {
    this.guests = this.guests.filter((guest) => guest !== sid);

    const screenName = this.chat.guests[sid].data.screenName;
    this.chat.guests[sid].data.room = undefined;

    this.broadcast(`${screenName} has left the room!\n`);
  }

  public broadcast(message: string) {
    this.guests.forEach((guest) => {
      this.chat.guests[guest].write(message);
    });
  }
}

export default Room;
