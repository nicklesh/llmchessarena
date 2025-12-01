import { ScrollArea } from '@/components/ui/scroll-area';

interface Move {
  number: number;
  notation: string;
  time?: number;
}

interface MoveNotationProps {
  moves: Move[];
  side: 'white' | 'black';
  playerName: string;
  currentMoveIndex?: number;
}

export default function MoveNotation({ moves, side, playerName, currentMoveIndex }: MoveNotationProps) {
  const sideColor = side === 'white' ? 'bg-white text-gray-900' : 'bg-gray-900 text-white';

  return (
    <div className="flex flex-col h-full border border-border rounded-md overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-muted">
        <div className={`w-3 h-3 rounded-sm border border-border ${sideColor}`} />
        <span className="text-sm font-medium truncate" title={playerName}>
          {playerName}
        </span>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {moves.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No moves yet
            </p>
          ) : (
            moves.map((move, index) => (
              <div
                key={`${move.number}-${index}`}
                className={`
                  flex items-center justify-between px-2 py-1 rounded text-sm font-mono
                  ${currentMoveIndex === index ? 'bg-primary/10' : ''}
                `}
                data-testid={`move-${side}-${move.number}`}
              >
                <span>
                  <span className="text-muted-foreground mr-1">{move.number}.</span>
                  <span className="font-medium">{move.notation}</span>
                </span>
                {move.time !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    {formatTime(move.time)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
