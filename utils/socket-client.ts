import {io} from "socket.io-client";

const socket = io(`${process.env.SOCKET_URL}:${process.env.SOCKET_PORT}`, {
    path: "/socket.io/",
    protocols: ["GET", "POST"],
    transports: ['websocket', 'polling'],
});

export const getSocket = () => {
    return socket
}