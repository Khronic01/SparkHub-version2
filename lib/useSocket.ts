
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Singleton for the socket instance to avoid multiple connections during re-renders
let socketInstance: Socket | undefined;

export const useSocket = (url: string = 'http://localhost:3001') => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | undefined>(undefined);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(url, {
        autoConnect: false,
        transports: ['websocket'], // Force websocket to avoid polling issues in some dev envs
        reconnectionAttempts: 5,
      });
    }
    socketRef.current = socketInstance;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);

    if (!socketInstance.connected) {
      socketInstance.connect();
    }

    return () => {
      socketInstance?.off('connect', onConnect);
      socketInstance?.off('disconnect', onDisconnect);
    };
  }, [url]);

  const joinRoom = (roomId: string) => {
    socketRef.current?.emit('join-room', roomId);
  };

  const leaveRoom = (roomId: string) => {
    socketRef.current?.emit('leave-room', roomId);
  };

  return { socket: socketRef.current, isConnected, joinRoom, leaveRoom };
};
