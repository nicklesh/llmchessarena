import MoveNotation from '../MoveNotation';

export default function MoveNotationExample() {
  const whiteMoves = [
    { number: 1, notation: 'e4', time: 45 },
    { number: 2, notation: 'Nf3', time: 32 },
    { number: 3, notation: 'Bb5', time: 28 },
    { number: 4, notation: 'Ba4', time: 15 },
    { number: 5, notation: 'O-O', time: 8 },
  ];

  const blackMoves = [
    { number: 1, notation: 'e5', time: 52 },
    { number: 2, notation: 'Nc6', time: 41 },
    { number: 3, notation: 'a6', time: 22 },
    { number: 4, notation: 'Nf6', time: 35 },
  ];

  return (
    <div className="flex gap-4 p-4 h-64">
      <div className="flex-1">
        <MoveNotation
          moves={whiteMoves}
          side="white"
          playerName="GPT-4o"
          currentMoveIndex={4}
        />
      </div>
      <div className="flex-1">
        <MoveNotation
          moves={blackMoves}
          side="black"
          playerName="Claude 3.5 Sonnet"
          currentMoveIndex={3}
        />
      </div>
    </div>
  );
}
