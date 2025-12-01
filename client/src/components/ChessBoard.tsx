import { useState, useEffect, useCallback } from 'react';
import { Chess, Square } from 'chess.js';

interface ChessBoardProps {
  game: Chess;
  onMove?: (from: string, to: string, promotion?: string) => void;
  disabled?: boolean;
  lastMove?: { from: string; to: string } | null;
}

const PIECE_SYMBOLS: Record<string, string> = {
  'wp': '♙', 'wr': '♖', 'wn': '♘', 'wb': '♗', 'wq': '♕', 'wk': '♔',
  'bp': '♟', 'br': '♜', 'bn': '♞', 'bb': '♝', 'bq': '♛', 'bk': '♚',
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export default function ChessBoard({ game, onMove, disabled = false, lastMove }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [showPromotion, setShowPromotion] = useState<{ from: string; to: string } | null>(null);

  const board = game.board();

  const calculateLegalMoves = useCallback((square: string) => {
    const moves = game.moves({ square: square as Square, verbose: true });
    return moves.map(m => m.to);
  }, [game]);

  const handleSquareClick = (square: string) => {
    if (disabled) return;

    const piece = game.get(square as Square);

    if (selectedSquare) {
      if (legalMoves.includes(square)) {
        const fromPiece = game.get(selectedSquare as Square);
        if (fromPiece?.type === 'p' && (square[1] === '8' || square[1] === '1')) {
          setShowPromotion({ from: selectedSquare, to: square });
          return;
        }
        onMove?.(selectedSquare, square);
      }
      setSelectedSquare(null);
      setLegalMoves([]);
    } else if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      setLegalMoves(calculateLegalMoves(square));
    }
  };

  const handlePromotion = (piece: string) => {
    if (showPromotion) {
      onMove?.(showPromotion.from, showPromotion.to, piece);
      setShowPromotion(null);
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  useEffect(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, [game.fen()]);

  const isInCheck = game.isCheck();
  const kingSquare = isInCheck ? findKingSquare(game, game.turn()) : null;

  return (
    <div className="relative">
      <div className="grid grid-cols-8 border border-border rounded-md overflow-hidden" data-testid="chess-board">
        {RANKS.map((rank, rankIndex) => (
          FILES.map((file, fileIndex) => {
            const square = `${file}${rank}`;
            const isLight = (rankIndex + fileIndex) % 2 === 0;
            const piece = board[rankIndex][fileIndex];
            const isSelected = selectedSquare === square;
            const isLegalMove = legalMoves.includes(square);
            const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);
            const isKingInCheck = kingSquare === square;

            const pieceKey = piece ? `${piece.color}${piece.type}` : null;

            return (
              <button
                key={square}
                onClick={() => handleSquareClick(square)}
                disabled={disabled}
                className={`
                  relative aspect-square flex items-center justify-center text-3xl sm:text-4xl md:text-5xl
                  transition-colors duration-100
                  ${isLight ? 'bg-amber-100 dark:bg-amber-200' : 'bg-amber-700 dark:bg-amber-800'}
                  ${isSelected ? 'ring-2 ring-inset ring-primary' : ''}
                  ${isLastMoveSquare ? 'bg-yellow-300 dark:bg-yellow-500' : ''}
                  ${isKingInCheck ? 'bg-red-400 dark:bg-red-600' : ''}
                  ${!disabled ? 'cursor-pointer' : 'cursor-default'}
                `}
                data-testid={`square-${square}`}
                aria-label={`Square ${square}${piece ? `, ${piece.color === 'w' ? 'white' : 'black'} ${piece.type}` : ''}`}
              >
                {pieceKey && piece && (
                  <span className={piece.color === 'w' ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]'}>
                    {PIECE_SYMBOLS[pieceKey]}
                  </span>
                )}
                {isLegalMove && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {piece !== null ? (
                      <div className="absolute inset-0 border-4 border-primary/50 rounded-full" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-primary/40" />
                    )}
                  </div>
                )}
                {fileIndex === 0 && (
                  <span className="absolute left-0.5 top-0.5 text-[10px] font-medium opacity-60 select-none">
                    {rank}
                  </span>
                )}
                {rankIndex === 7 && (
                  <span className="absolute right-0.5 bottom-0.5 text-[10px] font-medium opacity-60 select-none">
                    {file}
                  </span>
                )}
              </button>
            );
          })
        ))}
      </div>

      {showPromotion && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-md">
          <div className="bg-card p-4 rounded-md shadow-lg">
            <p className="text-sm font-medium mb-2 text-center">Promote to:</p>
            <div className="flex gap-2">
              {['q', 'r', 'b', 'n'].map((piece) => (
                <button
                  key={piece}
                  onClick={() => handlePromotion(piece)}
                  className="w-12 h-12 flex items-center justify-center text-3xl bg-secondary rounded-md hover-elevate active-elevate-2"
                  data-testid={`promote-${piece}`}
                >
                  {PIECE_SYMBOLS[`${game.turn()}${piece}`]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function findKingSquare(game: Chess, color: 'w' | 'b'): string | null {
  const board = game.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (piece && piece.type === 'k' && piece.color === color) {
        return `${FILES[f]}${RANKS[r]}`;
      }
    }
  }
  return null;
}
