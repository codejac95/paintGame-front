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
    const [activeComponent, setActiveComponent] = useState<'drawing' | 'image'>('image');
    const [imageIndex, setImageIndex] = useState<number>(0);
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
                 // Subscribe to drawingCountdown topic to switch back to image after drawing ends
                 const countdownSubscription = stompClient.subscribe("/topic/drawingCountdown", (message) => {
                    const { action } = JSON.parse(message.body);
                    if (action === "countdownEndedDraw") {
                        setActiveComponent('image');
                    }
                });

                return () => {subscription.unsubscribe();

                            //testing
                            countdownSubscription.unsubscribe();
                };
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

    const handleImageTimeout = () => {
        // Use setTimeout to delay state update until after the current render completes
        setTimeout(() => {
            setActiveComponent('drawing');
        }, 0);
        setImageIndex((prevIndex) => (prevIndex +1) % 5)
    };
   
    
    
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
            {activeComponent === 'image' && (
              <ShowPictureComponent 
              onPaintTimeout={handleImageTimeout} 
              imageIndex={imageIndex}
             
            />
            )}
             {activeComponent === 'drawing' && assignedSquare !== null && (
                <DrawingComponent assignedSquare={assignedSquare} playerName={username} />
              )}
     
            </>
          )}
        </div>
      );
    }

export default GameComponent;


