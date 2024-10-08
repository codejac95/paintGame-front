import React, { useEffect, useState, createContext, useContext } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface WebSocketProviderProps {
    children: React.ReactNode;
}

const WebSocketContext = createContext<Client | null>(null);
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        console.log(isConnected);
        const socket = new SockJS("https://plankton-app-dtvpj.ondigitalocean.app/websocket");
        //const socket = new SockJS('http://localhost:8080/websocket');
        const client = new Client({

            webSocketFactory: () => socket,
            onConnect: () => {
                setIsConnected(true);
            },
            onDisconnect: () => {
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
                stompClient.onConnect = () => { };
            }
        };
    }, []);

    return (
        <WebSocketContext.Provider value={stompClient}>
            <div>
                {children}
            </div>
        </WebSocketContext.Provider>

    )
};
export const useWebSocket = () => useContext(WebSocketContext)


