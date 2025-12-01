import { useState } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from '../ChessBoard';

export default function ChessBoardExample() {
  const [game, setGame] = useState(new Chess());
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  const handleMove = (from: string, to: string, promotion?: string) => {
    const gameCopy = new Chess(game.fen());
    try {
      gameCopy.move({ from, to, promotion });
      setGame(gameCopy);
      setLastMove({ from, to });
    } catch (e) {
      console.log('Invalid move');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <ChessBoard 
        game={game} 
        onMove={handleMove} 
        lastMove={lastMove}
      />
    </div>
  );
}
