import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";

const io = new Server();

const engine = new Engine({
    path: "/socket.io/",
    cors: {
        origin: "http://localhost:3000",
        methods: ["POST", "GET"],
    }
});

io.bind(engine);

io.on("connection", (socket) => {
    socket.on("trpc:createpost", (name: string) => {
        io.emit("trpc:createpost", name);
    })
});

export default {
    port: 4000,
    idleTimeout: 30, // must be greater than the "pingInterval" option of the engine, which defaults to 25 seconds

    ...engine.handler(),
};