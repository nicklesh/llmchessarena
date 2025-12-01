import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

export interface GameResult {
  gameNumber: number;
  result: 'white' | 'black' | 'draw';
  reason: string;
}

interface ScorecardProps {
  whitePlayer: string;
  blackPlayer: string;
  results: GameResult[];
  totalGames: number;
}

export default function Scorecard({ whitePlayer, blackPlayer, results, totalGames }: ScorecardProps) {
  const whiteScore = results.reduce((acc, r) => acc + (r.result === 'white' ? 1 : r.result === 'draw' ? 0.5 : 0), 0);
  const blackScore = results.reduce((acc, r) => acc + (r.result === 'black' ? 1 : r.result === 'draw' ? 0.5 : 0), 0);
  
  const matchComplete = results.length === totalGames;
  const winner = matchComplete 
    ? whiteScore > blackScore ? 'white' 
    : blackScore > whiteScore ? 'black' 
    : 'draw'
    : null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5" />
          Match Scorecard
          {matchComplete && (
            <Badge variant="secondary" className="ml-auto">
              Match Complete
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
            <span>Game</span>
            <span>Result</span>
            <span className="text-center">{whitePlayer}</span>
            <span className="text-center">{blackPlayer}</span>
          </div>
          
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No games played yet
            </p>
          ) : (
            results.map((game) => (
              <div 
                key={game.gameNumber} 
                className="grid grid-cols-4 gap-2 text-sm items-center"
                data-testid={`game-result-${game.gameNumber}`}
              >
                <span className="font-medium">Game {game.gameNumber}</span>
                <span className="text-muted-foreground truncate" title={game.reason}>
                  {game.reason}
                </span>
                <span className="text-center font-mono">
                  {game.result === 'white' ? '1' : game.result === 'draw' ? '½' : '0'}
                </span>
                <span className="text-center font-mono">
                  {game.result === 'black' ? '1' : game.result === 'draw' ? '½' : '0'}
                </span>
              </div>
            ))
          )}

          <div className="grid grid-cols-4 gap-2 pt-2 border-t font-semibold">
            <span className="col-span-2">Total Score</span>
            <span className="text-center font-mono text-lg">{whiteScore}</span>
            <span className="text-center font-mono text-lg">{blackScore}</span>
          </div>

          {matchComplete && winner && (
            <div className="mt-4 p-4 rounded-md bg-primary/10 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-semibold text-lg">
                {winner === 'draw' 
                  ? 'Match ends in a Draw!' 
                  : `${winner === 'white' ? whitePlayer : blackPlayer} Wins the Match!`
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
