import { useEffect } from "react";
import { useWebSocket } from "./WebSocketComponent";

function HighscoreScreen() {
    const stompClient = useWebSocket();

    useEffect(() => {
        if (stompClient) {
            stompClient.publish({
                destination: '/app/resetSquares'
            }
        );
        } else {
            console.log("else");
            
        }
        console.log("testing");
        
    }, [stompClient]); 

    return (
        <>
            <h1>Hejsan</h1>
            <h2>Här ska det vara en lista med den senaste matchens resultat</h2>
        </>
    );
}

export default HighscoreScreen;
