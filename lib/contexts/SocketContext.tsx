"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import { socket as baseSocket } from "@/lib/socket";
import type { ServerToClientEvents, ClientToServerEvents } from "@/lib/socket";

type TSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextValue {
  socket: TSocket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    function onConnect() {
      console.log("Socket connected");
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log("Socket disconnected");
      setIsConnected(false);
    }

    function onConnectError(error: any) {
      console.error("Socket connection error:", error);
    }

    baseSocket.on("connect", onConnect);
    baseSocket.on("disconnect", onDisconnect);
    baseSocket.on("connect_error", onConnectError);

    if (!baseSocket.connected) {
      baseSocket.connect();
    }

    return () => {
      baseSocket.off("connect", onConnect);
      baseSocket.off("disconnect", onDisconnect);
      baseSocket.off("connect_error", onConnectError);
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{ socket: baseSocket as TSocket, isConnected }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return ctx;
}
