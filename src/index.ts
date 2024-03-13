import dotenv from "dotenv";
dotenv.config();
import { app } from "./app";
import { createConnection } from "./db/connection";
import { Server } from "socket.io";
import namespace from "./sockets/namespace";
const port = process.env.PORT || 8080;

createConnection()
    .then(() => {
        let serverInstance = app.listen(port, () => {
            console.log(`server running on: http://localhost:${port}`);
        });
        const io: Server = new Server(serverInstance, {
            cors: {
                origin: process.env.CLIENT_ORIGIN,
                methods: ["GET", "POST"],
                credentials: true,
            },
        });
        namespace(io);
    })
    .catch((error) => {
        console.log("connection error", error);
    });
