import { useState, useEffect, useCallback } from 'react';
import { wsService, ConnectionState } from '../services/websocket';
import { STORAGE_KEYS } from '../utils/constants';
import type { WSMessage } from '../types/api';

export const useWebSocket = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(wsService.state);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      wsService.connect(token);
    }

    const unsubscribe = wsService.onStateChange((state) => {
      setConnectionState(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const subscribe = useCallback((handler: (msg: WSMessage) => void) => {
    return wsService.subscribe(handler);
  }, []);

  return {
    connectionState,
    subscribe,
  };
};

