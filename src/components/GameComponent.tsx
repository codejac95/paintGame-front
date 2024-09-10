import { useEffect, useState } from "react";
import ShowPictureComponent from "./ShowPictureComponent";
import DrawingComponent from "./DrawingComponent";
import { useWebSocket } from "./WebSocketComponent";
import ScoreCalculator from "../types/ScoreCalculator";


interface GameCompProp{
    loginStatus: boolean;
    playerId: string;
}

function GameComponent({}: GameCompProp) {
    const [activeComponent, setActiveComponent] = useState<'drawing' | 'image' | 'score'>('drawing');
    const stompClient = useWebSocket();

    const handleButtonClick = (component: 'drawing' | 'image'| 'score') => {
        setActiveComponent(component);

        if (component === 'image' && stompClient && stompClient.connected) {
            stompClient.publish({
                destination: "/app/showComponent",
                body: JSON.stringify({ action: 'showImage' }),
            });
        }
    };
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

    

    return (
        <div>
           
                <>
                    {/* Display buttons and game components after login */}
                    <div>
                        <button onClick={() => handleButtonClick('drawing')}>Players</button>
                        <button onClick={() => handleButtonClick('image')}>Image</button>
                        <button onClick={() => handleButtonClick('score')}>Update Score</button> 
                    </div>
                    {activeComponent === 'drawing' && <DrawingComponent />}
                    {activeComponent === 'image' && <ShowPictureComponent />}
                    {activeComponent === 'score' && <ScoreCalculator playerId="yourPlayerId" />} 

                </>
           
        </div>
    );
}

export default GameComponent;


