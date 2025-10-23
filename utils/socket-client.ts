import {io} from "socket.io-client";
import { env } from "~/env";

const socket = io(`${env.NEXT_PUBLIC_SOCKET_URL}`, {
    path: "/socket.io/",
    protocols: ["GET", "POST"],
    transports: ['websocket', 'polling'],
    timeout: 20000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: true,
});

export const getSocket = () => {
    return socket
}