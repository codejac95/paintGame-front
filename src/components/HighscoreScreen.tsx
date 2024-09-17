import { useEffect, useState } from "react";
import { useWebSocket } from "./WebSocketComponent";
import React from "react";

interface Player {
    playerName: string,
    playerScore: number;
}

const playerList: React.FC = () => {

    const [players, setPlayers] = useState<Player[]>([])

    useEffect(() => {
        const fetchPlayers = async () => {
            const response = await fetch(' http://localhost:8080/player/getAll');
            // const response = await fetch('https://plankton-app-dtvpj.ondigitalocean.app/player/getAll');
            if (response) {
                console.log("Det fick du ");
                const data = await response.json();

                setPlayers(data);
                console.log("Detta är spelarna" + players);

            }

        }
        fetchPlayers()
    }, [])

    return (
        <>
            <h1>Hejsan</h1>
            <h2>Här ska det vara en lista med den senaste matchens resultat</h2>
            {/* <button onClick={showScore} ></button> */}

        </>
    );
}

export default playerList;
