import { useEffect } from 'react';
import socket from '../lib/socket';

export function useSocket<T = any>(event: string, callback: (data: T) => void) {
  useEffect(() => {
    socket.on(event, callback);
    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);

  return socket;
}
