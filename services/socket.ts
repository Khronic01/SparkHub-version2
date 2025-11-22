import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Ensure we only have one socket instance
let socket: Socket | undefined;

export const useSocket = (url: string = 'http://localhost:3001') => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(url, {
        autoConnect: false,
      });
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Connect manually
    socket.connect();

    return () => {
      socket?.off('connect', onConnect);
      socket?.off('disconnect', onDisconnect);
      socket?.disconnect();
    };
  }, [url]);

  return { socket, isConnected };
};

// Example Server-Side logic (pseudocode for reference):
/*
import { Server } from 'socket.io';

const io = new Server(res.socket.server);
res.socket.server.io = io;

io.on('connection', (socket) => {
  socket.on('send-message', (msg) => {
    io.emit('receive-message', msg);
  });
});
*/