import Scorecard from '../Scorecard';

export default function ScorecardExample() {
  const results = [
    { gameNumber: 1, result: 'white' as const, reason: 'Checkmate' },
    { gameNumber: 2, result: 'draw' as const, reason: 'Stalemate' },
    { gameNumber: 3, result: 'black' as const, reason: 'Resignation' },
  ];

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Scorecard
        whitePlayer="GPT-4o"
        blackPlayer="Claude 3.5 Sonnet"
        results={results}
        totalGames={3}
      />
    </div>
  );
}
