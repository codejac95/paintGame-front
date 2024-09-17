import { useEffect, useState } from "react";
import ShowPictureComponent from "./ShowPictureComponent";
import DrawingComponent from "./DrawingComponent";
import { useWebSocket } from "./WebSocketComponent";
import HighscoreScreen from "./HighscoreScreen";


interface GameCompProp {
    loginStatus: boolean;
    assignedSquare: number | null;
    playerName: string;
    playerId: string;
}

function GameComponent({ loginStatus, assignedSquare, playerId }: GameCompProp) {
    const [activeComponent, setActiveComponent] = useState<'drawing' | 'image' | "showHighscoreScreen">('image');
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
                        saveScore()
                        setActiveComponent('showHighscoreScreen');
                    }
                });

                return () => {
                    subscription.unsubscribe();

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
                stompClient.onConnect = () => { };
            }
        };
    }, [stompClient]);


    //****************************************************
    // saveScore() fungerar inte men det är något sånt vi ska göra tror jag /Christopher
    // ***************************************************
    async function saveScore() {
        if (playerId !== null) {
            let myScore = localStorage.getItem("myScore")

            fetch("http://localhost:8080/player/update/" + playerId, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                body: myScore
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Detta får du tillbaka : " + data);

                    console.log("Du skickade poängen : " + data.score);
                    console.log("Och användaren med id : " + data.playerId)
                })
        } else {
            console.log("There is no player in Local storage");
        }
    }

    const handleImageTimeout = () => {
        // Use setTimeout to delay state update until after the current render completes
        setTimeout(() => {
            setActiveComponent('drawing');
        }, 0);
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
            {loginStatus &&
                <div>
                    {activeComponent === 'image' &&
                        <ShowPictureComponent
                            onPaintTimeout={handleImageTimeout}
                            imageIndex={imageIndex}
                        />
                    }
                    {activeComponent === 'drawing' && assignedSquare !== null &&
                        <DrawingComponent assignedSquare={assignedSquare} playerName={username} />
                    }
                    {activeComponent === "showHighscoreScreen" && < HighscoreScreen />}
                </div>
            }
        </>
    )
}

export default GameComponent;


