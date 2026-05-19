const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("join-room", ({ room, name }) => {
    socket.join(room);
    socket.data.room = room;
    socket.data.name = name;
    socket.to(room).emit("system-message", `${name} joined the room`);
  });

  socket.on("leave-room", ({ room, name }) => {
    socket.to(room).emit("system-message", `${name} left the room`);
    socket.leave(room);
  });

  socket.on("chat-message", ({ room, name, message }) => {
    io.to(room).emit("chat-message", { name, message });
  });

  socket.on("screen-share-started", ({ room, name }) => {
    socket.to(room).emit("screen-share-started", { name });
  });

  socket.on("screen-share-stopped", ({ room, name }) => {
    socket.to(room).emit("screen-share-stopped", { name });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
