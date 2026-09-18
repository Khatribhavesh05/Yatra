import { WSMessage } from '../types/api';

export type ConnectionState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export type WSMessageHandler = (message: WSMessage) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private handlers: Set<WSMessageHandler> = new Set();
  private stateHandlers: Set<(state: ConnectionState) => void> = new Set();
  private _state: ConnectionState = 'disconnected';
  private intentionallyDisconnected = false;
  
  constructor() {
    this.url = '';
  }
  
  get state() { return this._state; }
  
  connect(token: string) {
    this.intentionallyDisconnected = false;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || (import.meta.env.VITE_API_BASE_URL?.replace('http', 'ws') || 'ws://localhost:8000');
    this.url = `${wsUrl}/ws/operator?token=${token}`;

    this.setState('connecting');
    this.establishConnection();
  }

  private establishConnection() {
    if (this.intentionallyDisconnected) return;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.setState('connected');
        this.reconnectAttempts = 0;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          this.handlers.forEach(handler => handler(message));
        } catch (error) {
          console.error('Failed to parse WS message', error);
        }
      };

      this.ws.onclose = () => {
        if (!this.intentionallyDisconnected) {
          this.setState('reconnecting');
          this.scheduleReconnect();
        } else {
          this.setState('disconnected');
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.setState('reconnecting');
      this.scheduleReconnect();
    }
  }
  
  disconnect() {
    this.intentionallyDisconnected = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setState('disconnected');
  }

  subscribe(handler: WSMessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  onStateChange(handler: (state: ConnectionState) => void): () => void {
    this.stateHandlers.add(handler);
    return () => {
      this.stateHandlers.delete(handler);
    };
  }

  private setState(state: ConnectionState) {
    if (this._state !== state) {
      this._state = state;
      this.stateHandlers.forEach(handler => handler(state));
    }
  }

  private scheduleReconnect() {
    if (this.intentionallyDisconnected) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setState('disconnected');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.establishConnection();
    }, delay);
  }
}

export const wsService = new WebSocketService();
