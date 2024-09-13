import { useEffect, useState } from "react";
import ShowPictureComponent from "./ShowPictureComponent";
import DrawingComponent from "./DrawingComponent";
import { useWebSocket } from "./WebSocketComponent";


interface GameCompProp{
    loginStatus: boolean;
    assignedSquare: number | null;
    playerName: string;
}

function GameComponent({loginStatus, assignedSquare}: GameCompProp) {
    const [_, setActiveComponent] = useState<'drawing' | 'image'>('drawing');
    const stompClient = useWebSocket();

 
    useEffect(() => {
        if (stompClient) {
            const onConnect = () => {
                const subscription = stompClient.subscribe("/topic/showImage", (message) => {
                    const { action } = JSON.parse(message.body);

                    if (action === "showImage") {
                        setActiveComponent('image');
                    }
                });

                return () => subscription.unsubscribe();
            };

            if (stompClient.connected) {
                onConnect();
            } else {
                stompClient.onConnect = onConnect;
            }
        }

        return () => {
            if (stompClient) {
                stompClient.onConnect = () => {};
            }
        };
    }, [stompClient]);
    const playerName = localStorage.getItem("loggedInPlayer");
    let username = '';

    if (playerName) {
        try {
            const parsedPlayer = JSON.parse(playerName); 
            username = parsedPlayer.username || '';   
        } catch (error) {
            console.error("Failed to parse playerName from localStorage", error);
            username = playerName;
        }
    }

    return (
        <div>
          {loginStatus && (
            <>
            <ShowPictureComponent />
              <div>
                
              </div>
              {assignedSquare !== null && (
                <DrawingComponent assignedSquare={assignedSquare} playerName={username} />
              )}
              
            </>
          )}
        </div>
      );
    }

export default GameComponent;


