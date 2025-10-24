"use client"

import React, {createContext, useContext, useEffect, useState} from "react";
import {type Socket} from "socket.io-client";
import {getSocket} from "../../../utils/socket-client";
import { api } from "~/trpc/react";

type SocketContextType = {
    socket: Socket;
    isConnected: boolean;
};

const SocketContext = createContext<SocketContextType | null>(null);

type SocketProviderProps = {
    children: React.ReactNode;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {

    const socket = getSocket();
    const [isConnected, setIsConnected] = useState(socket.connected);

    const utils= api.useUtils();


    useEffect(() => {
        socket.connect();

        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{socket, isConnected}}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
    return ctx;
};
