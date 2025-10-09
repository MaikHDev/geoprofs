import { createServer } from "http";
import { Server,  type Socket } from "socket.io";

const httpServer = createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("socket server ok");
});

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["POST", "GET"],
    }, // tighten later
});

io.on("connection", (socket: Socket) => {
    console.log("conn", socket.id);

    socket.on("msg", (data: string) => {
        io.emit("msg", data);
    });

    socket.on("disconnect", () => {
        console.log("disconnected:", socket.id);
    });
});

const port = Number(process.env.SOCKET_PORT) ?? 10000;
httpServer.listen(port, () => console.log(`listening on port ${port}`));
