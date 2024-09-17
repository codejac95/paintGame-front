import { useEffect, useState } from "react";
import { useWebSocket } from "./WebSocketComponent";
import React from "react";

interface Player {
    playerName: string,
    playerScore: number[];
}
function HighscoreScreen() {
    // const [players, setPlayers] = useState<Player[]>([])
    const [player1Name, setPlayer1Name] = useState<string>("");
    const [player2Name, setPlayer2Name] = useState<string>("");
    const [player3Name, setPlayer3Name] = useState<string>("");
    const [player4Name, setPlayer4Name] = useState<string>("");

    const [player1Score, setPlayer1Score] = useState<number>(0);
    const [player2Score, setPlayer2Score] = useState<number>(0);
    const [player3Score, setPlayer3Score] = useState<number>(0);
    const [player4Score, setPlayer4Score] = useState<number>(0);

    const [showScoreForRealsBool, setShowScoreForRealsBool] = useState<boolean>(false)

    async function showScore() {

        //const response = await fetch('https://plankton-app-dtvpj.ondigitalocean.app/player/getAll', {
        const response = await fetch("http://localhost:8080/player/getAll", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPlayer1Name(data[0].username)
        setPlayer1Score(data[0].scoreList[data[0].scoreList.length - 1])
        setPlayer2Name(data[1].username)
        setPlayer2Score(data[1].scoreList[data[1].scoreList.length - 1])
        setPlayer3Name(data[2].username)
        setPlayer3Score(data[2].scoreList[data[2].scoreList.length - 1])
        setPlayer4Name(data[3].username)
        setPlayer4Score(data[3].scoreList[data[3].scoreList.length - 1])

        console.log("datan som sparas till playerlistan : " + data);
        console.log("Den första spelaren i listan" + data[1].username);
        console.log("Den första spelaren i listan" + data[1].playerScore);

        showScoreForReals()

    }

    function showScoreForReals() {
        if (showScoreForRealsBool === true) {
            setShowScoreForRealsBool(false)
        } else {
            setShowScoreForRealsBool(true)
        }
    }




    return (
        <>
            <button onClick={showScore} >Poängen då va</button>

            {showScoreForRealsBool === true &&
                <div> <p>{player1Name} fick {player1Score}% rätt</p>
                    <p>{player2Name} fick {player2Score}% rätt</p>
                    <p>{player3Name} fick {player3Score}% rätt</p>
                    <p>{player4Name} fick {player4Score}% rätt</p></div>}


        </>
    );
}


export default HighscoreScreen;


// *****************************************


// import React, { useEffect, useState } from 'react';

// interface Player {
//     username: string;
//     scoreList: number[];
// }

// const PlayersList: React.FC = () => {
//     const [players, setPlayers] = useState<Player[]>([]);

//     useEffect(() => {
//         const fetchPlayers = async () => {
//             const response = await fetch("/getAll");
//             if (!response.ok) {
//                 throw new Error("Failed to fetch players");
//             }
//             const data = await response.json();
//             const filteredData = data.map((player: any) => ({
//                 username: player.username,
//                 scoreList: player.scoreList,
//             }));
//             console.log(filteredData + "skiten då va!");

//             setPlayers(filteredData);
//         };
//         console.log(players + "all vår skit");



//         fetchPlayers();
//     }, []);

//     return (
//         <div>
//             <h1>Lista över spelare</h1>
//             {players.length === 0 ? (
//                 <p>Inga spelare hittades</p>
//             ) : (
//                 <ul>
//                     {players.map((player, index) => (
//                         <li key={index}>
//                             <strong>{player.username}</strong>:{" "}
//                             {player.scoreList && player.scoreList.length > 0
//                                 ? player.scoreList.join(", ")
//                                 : "Ingen poäng registrerad"}
//                         </li>
//                     ))}
//                 </ul>
//             )}
//         </div>
//     );
// };

// export default PlayersList;

