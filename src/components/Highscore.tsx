import React, { useEffect, useState } from 'react';


interface PlayerAverageScore {
  username: string;
  averageScore: number;
}

const Highscore: React.FC = () => {
  const [players, setPlayers] = useState<PlayerAverageScore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchPlayerAverageScores = async () => {
      try {
       // const response = await fetch(' http://localhost:8080/player/averageScorePerPlayer'); 
        const response = await fetch('https://plankton-app-dtvpj.ondigitalocean.app/player/averageScorePerPlayer');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data: PlayerAverageScore[] = await response.json();
        const topFivePlayers = data.sort((a, b) => b.averageScore - a.averageScore).slice(0, 5);
        setPlayers(topFivePlayers);
      } catch (err) {

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerAverageScores();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Player Average Score</h2>
      <ul>
        {players.map((player) => (
          <li key={player.username}>
            <strong>{player.username}</strong>: {player.averageScore.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Highscore;
