
import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // --- Room Management ---
  socket.on("join-room", (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("leave-room", (roomId: string) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} left room ${roomId}`);
  });

  // --- Chat Messages ---
  socket.on("message:send", (data: { roomId: string; message: any }) => {
    // Broadcast to room including sender (or excluding if desired)
    io.to(data.roomId).emit("message:new", data.message);
  });

  socket.on("typing:start", (data: { roomId: string; user: string }) => {
    socket.to(data.roomId).emit("typing:start", { user: data.user });
  });

  socket.on("typing:stop", (data: { roomId: string; user: string }) => {
    socket.to(data.roomId).emit("typing:stop", { user: data.user });
  });

  // --- Task Events ---
  socket.on("task:event", (data: { taskId: string; action: string; payload: any }) => {
    const eventName = `task:${data.action}`;
    console.log(`Broadcasting ${eventName} to task:${data.taskId}`);
    socket.to(`task:${data.taskId}`).emit(eventName, data.payload);
  });

  // --- Idea Events ---
  socket.on("idea:event", (data: { ideaId: string; action: string; payload: any }) => {
    const eventName = `idea:${data.action}`; 
    console.log(`Broadcasting ${eventName} to idea:${data.ideaId}`);
    socket.to(`idea:${data.ideaId}`).emit(eventName, data.payload);
  });

  // --- Notifications ---
  // This allows a client (or backend service acting as client) to trigger a notification
  socket.on("notification:send", (data: { userId: string; notification: any }) => {
    console.log(`Sending notification to user:${data.userId}`);
    // Broadcast to the specific user's room
    io.to(`user:${data.userId}`).emit("notification:new", data.notification);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
