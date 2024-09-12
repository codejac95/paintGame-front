import React, { useEffect, useState, createContext, useContext } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface WebSocketProviderProps {
    children: React.ReactNode;
}

const WebSocketContext = createContext<Client | null>(null);

export const WebSocketProvider: React.FC<WebSocketProviderProps>  = ({ children }) => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    
    useEffect(() => {
        const connectWebSocket = () => {
            const socket = new SockJS('https://plankton-app-dtvpj.ondigitalocean.app/websocket');
            // const socket = new SockJS('http://localhost:8080/websocket'); 
            const client = new Client({
                webSocketFactory: () => socket,
                onConnect: () => {
                    console.log('Connected to WebSocket');
                    setIsConnected(true);
                },
                onDisconnect: () => {
                    console.log('Disconnected from WebSocket');
                    setIsConnected(false);
                },
                onStompError: (error) => {
                    console.error('Error connecting to WebSocket', error);
                    setIsConnected(false);
                },
                reconnectDelay: 5000, 
            });

            client.activate();
            setStompClient(client);
        };

        const timer = setTimeout(connectWebSocket, 1000);

        return () => {
            clearTimeout(timer); 
            if (stompClient) {
                stompClient.deactivate(); 
            }
        };
    }, []);

    return (
        <WebSocketContext.Provider value={stompClient}>
            <div>
                <h2>WebSocket Testing </h2>
                <p>WebSocket is {isConnected ? 'connected' : 'disconnected'}</p>
                {children}            
            </div>
        </WebSocketContext.Provider>
      
    )
};
export const useWebSocket = () => useContext(WebSocketContext)


