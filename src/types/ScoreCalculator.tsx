import React, { useState, useEffect } from 'react';

interface UpdateScoreFormProps {
    playerId: string; 
}

function ScoreCalculator({ playerId }: UpdateScoreFormProps) {
    const [correctPixels, setCorrectPixels] = useState<number>(0);
    const totalPixels = 256; 
    const [score, setScore] = useState<number>(0);

    useEffect(() => {
       
        setScore((correctPixels / totalPixels) * 100);
    }, [correctPixels]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
  
      if (correctPixels < 0 || correctPixels > totalPixels) {
          alert("Correct pixels must be between 0 and " + totalPixels);
          return;
      }
  
      const roundedScore = Math.round(score); 
      updateScore(playerId, roundedScore);
  };

    const updateScore = (playerId: string, score: number) => {
        fetch(`http://localhost:8080/player/update/${playerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ newScore: score }),
        })
            .then(response => {
                console.log(`Response status: ${response.status}`); 
                return response.text();
            })
         
            .catch(error => {
                console.error("Error updating score:", error);
                alert("Failed to update score");
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="number"
                value={correctPixels}
                onChange={(e) => setCorrectPixels(parseInt(e.target.value))}
                placeholder="Correct Pixels"
                required
            />
        
            <div>
                <strong>Calculated Score: {score.toFixed()}</strong> {}
            </div>
            <button type="submit">Update Score</button>
        </form>
    );
}

export default ScoreCalculator;
