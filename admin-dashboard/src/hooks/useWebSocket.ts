import { useState, useEffect } from 'react';
import { wsService, ConnectionState } from '../services/websocket';
import { STORAGE_KEYS } from '../utils/constants';

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
      wsService.disconnect();
    };
  }, []);

  return { connectionState };
};
