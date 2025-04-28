import { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketMessage, WebSocketMessageType } from '@shared/types';

interface UseWebSocketOptions {
  url?: string;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  onOpen?: (event: Event) => void;
  onMessage?: (data: any) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    reconnectInterval = 3000,
    reconnectAttempts = 5,
    onOpen,
    onMessage,
    onClose,
    onError
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const [url, setUrl] = useState<string | null>(options.url || null);
  
  const connect = useCallback(() => {
    if (!url) return;
    
    // Close existing connection
    if (socketRef.current) {
      socketRef.current.close();
    }
    
    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = url.startsWith('ws') ? url : `${protocol}//${window.location.host}${url}`;
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = (event) => {
      setIsConnected(true);
      reconnectCount.current = 0;
      if (onOpen) onOpen(event);
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        if (onMessage) onMessage(data);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
    
    socket.onclose = (event) => {
      setIsConnected(false);
      if (onClose) onClose(event);
      
      // Attempt to reconnect
      if (reconnectCount.current < reconnectAttempts) {
        setTimeout(() => {
          reconnectCount.current += 1;
          connect();
        }, reconnectInterval);
      }
    };
    
    socket.onerror = (event) => {
      if (onError) onError(event);
    };
    
    socketRef.current = socket;
  }, [url, reconnectInterval, reconnectAttempts, onOpen, onMessage, onClose, onError]);
  
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);
  
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);
  
  // Connect when URL changes
  useEffect(() => {
    if (url) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [url, connect, disconnect]);
  
  return {
    isConnected,
    lastMessage,
    sendMessage,
    setUrl,
    connect,
    disconnect
  };
}

export function useBusinessWebSocket(businessId?: number) {
  const wsUrl = businessId ? `/ws?businessId=${businessId}` : null;
  
  const { 
    isConnected, 
    lastMessage, 
    sendMessage 
  } = useWebSocket({
    url: wsUrl,
    onOpen: () => console.log(`WebSocket connected for business ${businessId}`),
    onError: (e) => console.error('WebSocket error:', e)
  });
  
  return {
    isConnected,
    lastMessage,
    sendMessage,
    sendChatMessage: (conversationId: number, content: string) => {
      return sendMessage({
        type: WebSocketMessageType.NEW_CHAT_MESSAGE,
        payload: {
          businessId,
          conversationId,
          message: {
            content,
            isFromBusiness: true
          }
        }
      });
    }
  };
}
