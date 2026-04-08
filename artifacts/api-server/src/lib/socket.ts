import { Server as SocketIOServer, Socket } from "socket.io";
import { logger } from "./logger";

interface UserInfo {
  username: string;
  age: number;
  gender: string;
  socketId: string;
}

interface ChatRoom {
  id: string;
  user1: UserInfo;
  user2: UserInfo;
}

const waitingQueue: UserInfo[] = [];
const activeRooms = new Map<string, ChatRoom>();
const socketToRoom = new Map<string, string>();
const socketToUser = new Map<string, UserInfo>();

export const getStats = () => ({
  activeUsers: socketToUser.size,
  activePairs: activeRooms.size,
  waitingUsers: waitingQueue.length,
});

function matchUsers(io: SocketIOServer, user1: UserInfo): void {
  if (waitingQueue.length === 0) {
    waitingQueue.push(user1);
    const socket1 = io.sockets.sockets.get(user1.socketId);
    if (socket1) {
      socket1.emit("waiting");
    }
    logger.info({ username: user1.username }, "User waiting for match");
    return;
  }

  // Don't match with yourself
  const idx = waitingQueue.findIndex((u) => u.socketId !== user1.socketId);
  if (idx === -1) {
    waitingQueue.push(user1);
    const socket1 = io.sockets.sockets.get(user1.socketId);
    if (socket1) {
      socket1.emit("waiting");
    }
    return;
  }

  const [user2] = waitingQueue.splice(idx, 1);
  const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const room: ChatRoom = { id: roomId, user1, user2 };
  activeRooms.set(roomId, room);
  socketToRoom.set(user1.socketId, roomId);
  socketToRoom.set(user2.socketId, roomId);

  const socket1 = io.sockets.sockets.get(user1.socketId);
  const socket2 = io.sockets.sockets.get(user2.socketId);

  if (socket1 && socket2) {
    socket1.join(roomId);
    socket2.join(roomId);

    socket1.emit("matched", {
      roomId,
      stranger: {
        username: user2.username,
        age: user2.age,
        gender: user2.gender,
      },
    });
    socket2.emit("matched", {
      roomId,
      stranger: {
        username: user1.username,
        age: user1.age,
        gender: user1.gender,
      },
    });

    logger.info({ roomId, user1: user1.username, user2: user2.username }, "Users matched");
  }
}

function leaveRoom(io: SocketIOServer, socketId: string): void {
  const roomId = socketToRoom.get(socketId);
  if (!roomId) return;

  const room = activeRooms.get(roomId);
  if (!room) return;

  socketToRoom.delete(socketId);

  // Notify the other user
  const otherSocketId =
    room.user1.socketId === socketId ? room.user2.socketId : room.user1.socketId;

  const otherSocket = io.sockets.sockets.get(otherSocketId);
  if (otherSocket) {
    otherSocket.emit("stranger_left");
    socketToRoom.delete(otherSocketId);
  }

  activeRooms.delete(roomId);
  logger.info({ roomId }, "Room closed");
}

export function setupSocketIO(io: SocketIOServer): void {
  io.on("connection", (socket: Socket) => {
    logger.info({ socketId: socket.id }, "Socket connected");

    socket.on("join", (data: { username: string; age: number; gender: string }) => {
      const user: UserInfo = {
        username: data.username,
        age: data.age,
        gender: data.gender,
        socketId: socket.id,
      };
      socketToUser.set(socket.id, user);
      matchUsers(io, user);
    });

    socket.on("message", (data: { text: string }) => {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId) return;

      const user = socketToUser.get(socket.id);
      if (!user) return;

      socket.to(roomId).emit("message", {
        text: data.text,
        from: "stranger",
        timestamp: new Date().toISOString(),
      });

      logger.debug({ roomId, username: user.username }, "Message sent");
    });

    socket.on("typing", (isTyping: boolean) => {
      const roomId = socketToRoom.get(socket.id);
      if (!roomId) return;
      socket.to(roomId).emit("typing", isTyping);
    });

    socket.on("leave_room", () => {
      leaveRoom(io, socket.id);
    });

    socket.on("find_new", (data: { username: string; age: number; gender: string }) => {
      leaveRoom(io, socket.id);
      const user: UserInfo = {
        username: data.username,
        age: data.age,
        gender: data.gender,
        socketId: socket.id,
      };
      socketToUser.set(socket.id, user);
      matchUsers(io, user);
    });

    socket.on("disconnect", () => {
      leaveRoom(io, socket.id);

      // Remove from waiting queue if present
      const idx = waitingQueue.findIndex((u) => u.socketId === socket.id);
      if (idx !== -1) {
        waitingQueue.splice(idx, 1);
      }

      socketToUser.delete(socket.id);
      logger.info({ socketId: socket.id }, "Socket disconnected");
    });
  });
}
