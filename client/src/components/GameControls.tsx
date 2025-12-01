import { Button } from '@/components/ui/button';
import { Play, Pause, Flag, Handshake } from 'lucide-react';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

interface GameControlsProps {
  status: GameStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onResign: () => void;
  onOfferDraw: () => void;
  canStart: boolean;
  currentTurn: 'w' | 'b';
}

export default function GameControls({
  status,
  onStart,
  onPause,
  onResume,
  onResign,
  onOfferDraw,
  canStart,
  currentTurn,
}: GameControlsProps) {
  const turnLabel = currentTurn === 'w' ? 'White' : 'Black';

  return (
    <div className="flex flex-wrap items-center gap-4">
      {status === 'idle' && (
        <Button
          onClick={onStart}
          disabled={!canStart}
          size="lg"
          data-testid="button-start"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Game
        </Button>
      )}

      {status === 'playing' && (
        <>
          <Button
            onClick={onPause}
            variant="secondary"
            size="lg"
            data-testid="button-pause"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
          <Button
            onClick={onOfferDraw}
            variant="outline"
            size="lg"
            data-testid="button-draw"
          >
            <Handshake className="w-4 h-4 mr-2" />
            Offer Draw ({turnLabel})
          </Button>
          <Button
            onClick={onResign}
            variant="destructive"
            size="lg"
            data-testid="button-resign"
          >
            <Flag className="w-4 h-4 mr-2" />
            Resign ({turnLabel})
          </Button>
        </>
      )}

      {status === 'paused' && (
        <>
          <Button
            onClick={onResume}
            size="lg"
            data-testid="button-resume"
          >
            <Play className="w-4 h-4 mr-2" />
            Resume
          </Button>
          <Button
            onClick={onResign}
            variant="destructive"
            size="lg"
            data-testid="button-resign"
          >
            <Flag className="w-4 h-4 mr-2" />
            Resign ({turnLabel})
          </Button>
        </>
      )}

      {status === 'finished' && (
        <Button
          onClick={onStart}
          size="lg"
          data-testid="button-new-game"
        >
          <Play className="w-4 h-4 mr-2" />
          New Match
        </Button>
      )}
    </div>
  );
}
