// "use client"

import {io} from "socket.io-client";

const socket = io("http://localhost:4000", {
    path: "/socket.io/",
    protocols: ["GET", "POST"],
    transports: ['websocket', 'polling'],
});

export const getSocket = () => {
    return socket
}