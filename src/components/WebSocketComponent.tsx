import React, { useEffect, useState, createContext, useContext } from 'react';
import { Client, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

interface WebSocketProviderProps {
    children: React.ReactNode;
}

const WebSocketContext = createContext<Client | null>(null);

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const [client, setClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socket = new SockJS('https://plankton-app-dtvpj.ondigitalocean.app/websocket');
        const stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
            setClient(stompClient);
        }, (error:any) => {
            console.error('WebSocket connection error:', error);
            setIsConnected(false);
        });

        return () => {
            if (stompClient.connected) {
                stompClient.disconnect(() => {
                    console.log('Disconnected from WebSocket');
                });
            }
        };
    }, []);

    return (
        <WebSocketContext.Provider value={client}>
            <div>
                <h2>WebSocket Testing</h2>
                <p>WebSocket is {isConnected ? 'connected' : 'disconnected'}</p>
                {children}
            </div>
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);