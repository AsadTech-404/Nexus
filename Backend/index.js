import app from "./src/app.js";
import "dotenv/config";
import { connectDB } from "./src/db/db.js";
import http from "http";
import { Server } from "socket.io";

// Connect to Database
connectDB();

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {

  socket.on("join-room", ({ roomId, userId }) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);

    socket.to(roomId).emit("user-joined", {
      userId,
      socketId: socket.id
    });
  });

  socket.on("signal", (data) => {
    io.to(data.to).emit("signal", {
      from: data.from,
      signal: data.signal
    });
  });

  // socket.on("disconnect", () => {
  //   console.log("User Disconnected:", socket.id);
  // });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});