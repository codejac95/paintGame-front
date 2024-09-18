
import "./types/global"
import {useEffect, useState } from 'react'
import LoginForm from './Login/LoginForm'
import CreatePlayerForm from './CreatePlayer/CreatePlayerForm'
import "./Appp.css";

import GameComponent from './components/GameComponent';
import { useWebSocket } from './components/WebSocketComponent';
import Highscore from './components/Highscore';



function App() {
  const [loginStatus, setLoginStatus] = useState<boolean>(false);
  const [joinedGame, setJoinedGame] = useState<boolean>(false);
  const [assignedSquare, setAssignedSquare] = useState<number | null>(null);
  const [occupiedSquares, setOccupiedSquares] = useState<number[]>([]);
  const stompClient = useWebSocket();
  const [showHighscores, setShowHighscores] = useState<boolean>(false);
  const [loggedInPlayer, setLoggedInPlayer] = useState<any>(null); // State to hold logged-in player data

  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedInPlayer');
    if (loggedIn) {
      setLoggedInPlayer(JSON.parse(loggedIn));
      setLoginStatus(true);
    }
  }, []);

  useEffect(() => {
    if (stompClient) {
      const onConnect = () => {
        const subscription = stompClient.subscribe('/topic/occupiedSquares', (message) => {
          const updatedOccupiedSquares = JSON.parse(message.body);
          setOccupiedSquares(updatedOccupiedSquares);
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

  const playerData = localStorage.getItem("loggedInPlayer");
  if (playerData) {
   // const player = JSON.parse(playerData!);
   // const username = player.username;

  }

  function handleLogOut(): void {
    if (assignedSquare !== null && stompClient) {
        stompClient.publish({
        destination: '/app/freeSquare',
        body: JSON.stringify(assignedSquare),
      });
    }

    const playerData = localStorage.getItem("loggedInPlayer");
    if (playerData) {
        const player = JSON.parse(playerData); 

        fetch('https://plankton-app-dtvpj.ondigitalocean.app/player/logout',{
        // fetch("http://localhost:8080/player/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(player), 
        })
        .then(()=> {
          console.log("loggar ut: ",player);
          
            localStorage.clear();
            setLoginStatus(false);
            setJoinedGame(false);
            setAssignedSquare(null);
        })
    }
}
  function handleLogin(): void {
    const loggedIn = localStorage.getItem('loggedInPlayer');
    if (loggedIn) {
      setLoggedInPlayer(JSON.parse(loggedIn));
    }
    setLoginStatus(true);
  }

  function handleJoinGame(): void {
    const availableSquare = [0, 1, 2, 3];
    const nextSquare = availableSquare.find((square) => !occupiedSquares.includes(square));

    if (nextSquare !== undefined) {
      setAssignedSquare(nextSquare);
      setJoinedGame(true);
      console.log('ruta läggs till  ', nextSquare);

      if (stompClient) {
        stompClient.publish({
          destination: '/app/assignSquare',
          body: JSON.stringify(nextSquare),
        });
      }
    } else {
      alert('4 players have already joined the game, wait for your turn');
    }
  }

  return (
    <>
      <div className="header">
        {loginStatus ? (
          <div className="loggedInHeader">
            <h1 className="loggedInHeaderText">Paint Game</h1>
            <button onClick={handleLogOut} className="logoutBtn">
              Logga ut
            </button>
            {!joinedGame && (
              <button onClick={handleJoinGame} className="joinGameBtn">
                Join game
              </button>
            )}
            <button onClick={() => setShowHighscores(!showHighscores)} className="highscoreBtn">
              {showHighscores ? 'Hide Highscores' : 'Show Highscores'}
            </button>
            {showHighscores && <Highscore />}


            {/* Render ScoreUpdateForm when logged in */}
            {/* {loggedInPlayer && (
              <ScoreUpdateForm playerId={loggedInPlayer.id} />
            )} */}

          </div>
        ) : (
          <div className="authContainer">
            <h1 className="loggedOutHeaderText">Paint Game</h1>
            <h2>Registrera</h2>
            <CreatePlayerForm onCreatePlayer={handleLogin} />
            <h2>Logga in</h2>
            <LoginForm onLogin={handleLogin} />
          </div>
        )}
      </div>
      <div>
        {loginStatus && joinedGame && (
          <GameComponent
            loginStatus={loginStatus}
            assignedSquare={assignedSquare}
            playerName={loggedInPlayer?.username || 'loggedInUser'}
          />
        )}
      </div>
    </>
  );
}

export default App;