import { IMessage } from "@/apis/chats/chats.type";
import { io, Socket } from "socket.io-client";

export interface ServerToClientEvents {
  message: (payload: IMessage) => void;
}

export interface ClientToServerEvents {
  sendMessage: (payload: IMessage) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  URL,
  {
    autoConnect: false,
    transports: ["websocket"],
  }
);
