
import { FormEvent, useState } from "react";

interface ScoreUpdateFormProps {
  playerId: string;
}

function ScoreUpdateForm({ playerId }: ScoreUpdateFormProps) {
  const [newScore, setNewScore] = useState<number | ''>('');
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);
  const totalPixels = 256;

  /// ut räkningen som jag tror är rätt räkne metod
  function calculateScore(score: number): number {
    return (score / totalPixels) * 100;
  }


  function handleScoreCalculation(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (newScore === '') return;

    const score = calculateScore(newScore);
    setCalculatedScore(score);
  }


  function handleScoreUpdate(): void {
    if (calculatedScore === null) return;

    fetch(`http://localhost:8080/player/update/${playerId}`, {
      // fetch(`https://plankton-app-dtvpj.ondigitalocean.app/player/update/${playerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newScore: calculatedScore,
      }),
    })
      .then((res) => {
        if (res.ok) {
          alert("Score updated successfully!");
          setNewScore('');
          setCalculatedScore(null);
        } else {
          alert("Failed to update score.");
        }
      })
      .catch((err) => {
        console.error("Error updating score:", err);
      });
  }

  return (
    <div>
      <form onSubmit={handleScoreCalculation}>
        <input
          type="number"
          value={newScore}
          onChange={(e) => setNewScore(Number(e.target.value))}

          //in matning av rätt antal pixlar
          placeholder="Antala rätt pixlar"
          required
        />
        <button type="submit">Räkna ut</button>
      </form>


      {calculatedScore !== null && (
        <div>
          <p>poäng: {calculatedScore.toFixed()}</p>
          <button onClick={handleScoreUpdate}>Updattera score</button>
        </div>
      )}
    </div>
  );
}

export default ScoreUpdateForm;
