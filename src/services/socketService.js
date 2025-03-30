import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.subscribers = new Map();
  }

  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:3000', {
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });

      // Обработка всех подписанных событий
      this.socket.onAny((event, data) => {
        const handlers = this.subscribers.get(event) || [];
        handlers.forEach((handler) => handler(data));
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event).push(callback);
  }

  unsubscribe(event, callback) {
    const handlers = this.subscribers.get(event) || [];
    const index = handlers.indexOf(callback);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

const socketService = new SocketService();
export default socketService;
