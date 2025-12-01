import { Badge } from '@/components/ui/badge';
import { LLM_PLAYERS, type LLMPlayerId } from './PlayerSelect';

interface SelectedPlayersProps {
  whitePlayer: LLMPlayerId | '';
  blackPlayer: LLMPlayerId | '';
}

export default function SelectedPlayers({ whitePlayer, blackPlayer }: SelectedPlayersProps) {
  const white = LLM_PLAYERS.find(p => p.id === whitePlayer);
  const black = LLM_PLAYERS.find(p => p.id === blackPlayer);

  if (!white && !black) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 p-4 rounded-md bg-muted/50">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm bg-white border border-gray-300" />
        <span className="text-sm text-muted-foreground">White:</span>
        {white ? (
          <Badge variant="secondary" data-testid="badge-white-player">
            {white.name}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground italic">Not selected</span>
        )}
      </div>
      
      <span className="text-muted-foreground font-bold">vs</span>
      
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-sm bg-gray-900 border border-gray-700" />
        <span className="text-sm text-muted-foreground">Black:</span>
        {black ? (
          <Badge variant="secondary" data-testid="badge-black-player">
            {black.name}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground italic">Not selected</span>
        )}
      </div>
    </div>
  );
}
