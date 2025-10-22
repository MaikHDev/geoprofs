"use client"

import React, {createContext, useContext, useEffect, useState} from "react";
import {type Socket} from "socket.io-client";
import {getSocket} from "../../../utils/socket-client";
import { api, type RouterOutputs } from "~/trpc/react";

type SocketContextType = {
    socket: Socket;
    isConnected: boolean;
    latestPosts: {
        id: number;
        name: string | null;
        createdAt: Date;
        updatedAt: Date | null
    }[]
};

const SocketContext = createContext<SocketContextType | null>(null);

type SocketProviderProps = {
    children: React.ReactNode;
    initialPosts: RouterOutputs["post"]["getAllLatest"];
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, initialPosts }) => {

    const socket = getSocket();
    const [isConnected, setIsConnected] = useState(socket.connected);

    const { data: latestPosts } = api.post.getAllLatest.useQuery(undefined, {
        initialData: initialPosts,
        refetchOnWindowFocus: false,
    });

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

        socket.on("trpc:createpost", async (msg: string) => {
            await utils.post.getAllLatest.invalidate();
        });


        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("trpc:createpost");
            socket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{socket, isConnected, latestPosts}}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
    return ctx;
};
