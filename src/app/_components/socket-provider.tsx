"use client"
export const dynamic = "force-dynamic"; // 👈 this line is key


import React, {createContext, useContext, useEffect, useState} from "react";
import {type Socket} from "socket.io-client";
import {getSocket} from "../../../utils/socket-client";
import {api} from "~/trpc/react";

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

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {

    const socket = getSocket();
    const [isConnected, setIsConnected] = useState(socket.connected);

    const [latestPosts, setLatestPosts] = useState<SocketContextType["latestPosts"]>([]);

    const getAllLatest = api.post.getAllLatest.useQuery(undefined, { enabled: false });

    const utils= api.useUtils();


    useEffect(() => {
        socket.connect();

        getAllLatest.refetch().then(({ data }) => {
            if (data) setLatestPosts(data);
        });
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
