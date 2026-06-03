import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
    });
  }
  return socket;
};
