import { useEffect, useState } from "react";
import ShowPictureComponent from "./ShowPictureComponent";
import DrawingComponent from "./DrawingComponent";
import { useWebSocket } from "./WebSocketComponent";
import HighscoreScreen from "./HighscoreScreen";

interface Player {
    id: string;
    username: string;
    passord: string;
    scoreList: string[];
    loggedIn: boolean;
}

interface GameCompProp {

    loginStatus: boolean;
    assignedSquare: number | null;
    playerName: string;
}

function GameComponent({ loginStatus, assignedSquare, }: GameCompProp) {
    const [activeComponent, setActiveComponent] = useState<'drawing' | 'image' | "showHighscoreScreen">('image');
    const [imageIndex, setImageIndex] = useState<number>(0);
    const stompClient = useWebSocket();

    // Importatnt for other projects. This is how you send a function to other components as a prop.
    const handleComponentChange = (component: "image" | "drawing" | "showHighscoreScreen") => {
        setActiveComponent(component)
    }

    useEffect(() => {
        if (stompClient) {
            const onConnect = () => {
                const subscription = stompClient.subscribe("/topic/showImage", (message) => {
                    const { action } = JSON.parse(message.body);

                    if (action === "showImage") {
                        setActiveComponent('image');

                    }
                });
                const countdownSubscription = stompClient.subscribe("/topic/drawingCountdown", (message) => {
                    const { action } = JSON.parse(message.body);
                    if (action === "countdownEndedDraw") {
                        saveScore()
                    }
                });

                return () => {
                    subscription.unsubscribe();

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
                stompClient.onConnect = () => { };
            }
        };
    }, [stompClient]);


    async function saveScore() {
        const player = localStorage.getItem("loggedInPlayer");
        if (player !== null) {
            try {
                let retrievedPlayer = JSON.parse(player) as Player;
                console.log(retrievedPlayer.id);

                const response = await fetch('https://plankton-app-dtvpj.ondigitalocean.app/player/update/' + retrievedPlayer.id, {
                    //const response = await fetch("http://localhost:8080/player/update/" + retrievedPlayer.id, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        "newScore": localStorage.getItem("myScore")

                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

            } catch (error) {
                console.error("Error updating score:", error);
            }
        } else {
            console.log("There is no player in Local storage");
        }
    }

    const handleImageTimeout = () => {
        setTimeout(() => {
            setActiveComponent('drawing');
        }, 1);
        setImageIndex((prevIndex) => (prevIndex + 1) % 5)
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
        <>
            {loginStatus && (
                <div>
                    {activeComponent === 'image' && <ShowPictureComponent onPaintTimeout={handleImageTimeout} imageIndex={imageIndex} />}
                    {activeComponent === 'drawing' && assignedSquare !== null && <DrawingComponent onComponentChange={handleComponentChange} assignedSquare={assignedSquare} playerName={username} />}
                    {activeComponent === "showHighscoreScreen" && < HighscoreScreen />}
                </div>
            )}
        </>
    );
}

export default GameComponent;