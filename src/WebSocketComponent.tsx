import React, { useEffect, useState } from 'react';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';


const WebSocketComponent: React.FC  = () => {
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    

    useEffect(() => {
       
        const socket = new SockJS('http://localhost:8080/ws');
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
        <div>
            <h2>WebSocket Testing </h2>
            <p>WebSocket is {isConnected ? 'connected' : 'disconnected'}</p>
            
            
        </div>
      
    )
};
export default WebSocketComponent