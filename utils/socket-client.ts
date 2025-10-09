import {io} from "socket.io-client";

const socket = io(`${process.env.SOCKET_URL}:${process.env.SOCKET_PORT}`, {
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