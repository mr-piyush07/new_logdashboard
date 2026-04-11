import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const socket = io(WS_URL, {
  autoConnect: false, // Prevents automatic connection until components are mounted
});
