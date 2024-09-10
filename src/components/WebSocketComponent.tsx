import React, { useEffect, useState, createContext, useContext } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

interface WebSocketProviderProps {
    children: React.ReactNode;
}

const WebSocketContext = createContext<Client | null>(null);
export const WebSocketProvider: React.FC<WebSocketProviderProps>  = ({ children }) => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    
    useEffect(() => { 
        const socket = new SockJS('https://plankton-app-dtvpj.ondigitalocean.app/ws')
        // const socket = new SockJS('http://localhost:8080/ws');
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
                console.log('Error connecting to WebSocket', error);
                setIsConnected(false);
            },
            reconnectDelay: 5000,         
        });
        client.activate();
        setStompClient(client);

        return () => {
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


