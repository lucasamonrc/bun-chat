import Room from "./room";

interface Guest {
  sid: string;
  screenName?: string;
  room?: Room;
}

export default Guest;
