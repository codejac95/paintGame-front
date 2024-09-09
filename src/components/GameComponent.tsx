import { useEffect, useState } from "react";
import ShowPictureComponent from "./ShowPictureComponent";
import RastaDrawingComponent from "./DrawingComponent";
import { useWebSocket } from "./WebSocketComponent";
import LoginAndPassComponent from "./LoginAndPassComponent";

function GameComponent() {
    const [activeComponent, setActiveComponent] = useState<'drawing' | 'image'>('drawing');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const stompClient = useWebSocket();

    const handleButtonClick = (component: 'drawing' | 'image') => {
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

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    }

    return (
        <div>
            {/* Display LoginAndPassComponent until the user logs in */}
            {!isLoggedIn ? (
                <LoginAndPassComponent onLoginSuccess={handleLoginSuccess} />
            ) : (
                <>
                    {/* Display buttons and game components after login */}
                    <div>
                        <button onClick={() => handleButtonClick('drawing')}>Players</button>
                        <button onClick={() => handleButtonClick('image')}>Image</button>
                    </div>
                    {activeComponent === 'drawing' && <RastaDrawingComponent />}
                    {activeComponent === 'image' && <ShowPictureComponent />}
                </>
            )}
        </div>
    );
}

export default GameComponent;


