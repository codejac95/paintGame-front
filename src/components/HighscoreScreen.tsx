import React, { useEffect, useState } from 'react';

 interface PlayerScoreDto {
    username: string;
    latestScore: number | null; 
  }
  

const HighScoreScreen: React.FC = () => {
  const [players, setPlayers] = useState<PlayerScoreDto[]>([]);
  

  useEffect(() => {
    
    const fetchPlayers = async () => {
      
        const response = await fetch('http://localhost:8080/player/loggedinPlayersScores');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data: PlayerScoreDto[] = await response.json();
        setPlayers(data);
        
      
      
    };

    fetchPlayers();
  }, []);


  return (
    <div>
      <h2>Score</h2>
      {players.length > 0 && (
        <ul>
          {players.map((player) => (
            <li key={player.username}>
              <strong>{player.username}</strong>: {player.latestScore !== null ? `${player.latestScore}%` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  
};

export default HighScoreScreen;
