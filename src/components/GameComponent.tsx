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
    const [activeComponent, setActiveComponent] = useState<'drawing' | 'image'>('drawing');
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

const playerName = localStorage.getItem("loggedInPlayer")

    return (
        <div>
          {loginStatus && (
            <>
            <ShowPictureComponent />
              <div>
                
              </div>
              {assignedSquare !== null && (
                <DrawingComponent assignedSquare={assignedSquare} playerName={playerName} />
              )}
              
            </>
          )}
        </div>
      );
    }

export default GameComponent;


