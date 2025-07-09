import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  showtimeId: number;
  seatNumbers: string[];
  status: string;
}

export function useWebSocket(
  showtimeId: number,
  userId: string,
  onMessage: (message: WebSocketMessage) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const websocket = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    if (websocket.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    websocket.current = new WebSocket(wsUrl);

    websocket.current.onopen = () => {
      setIsConnected(true);
      
      // Join the showtime room
      if (showtimeId && userId) {
        websocket.current?.send(JSON.stringify({
          type: 'join_showtime',
          showtimeId,
          userId,
        }));
      }
    };

    websocket.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        onMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    websocket.current.onclose = () => {
      setIsConnected(false);
      
      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    websocket.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const sendMessage = (message: any) => {
    if (websocket.current?.readyState === WebSocket.OPEN) {
      websocket.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    if (showtimeId && userId) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (websocket.current) {
        websocket.current.close();
      }
    };
  }, [showtimeId, userId]);

  return { isConnected, sendMessage };
}
