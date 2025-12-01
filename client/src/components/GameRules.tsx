import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ExternalLink } from 'lucide-react';

export default function GameRules() {
  const rules = [
    {
      title: 'Gameplay',
      items: [
        'White always moves first',
        'Each player must make a legal chess move when it is their turn',
        'The game ends when there is checkmate, stalemate, or a player resigns',
      ],
    },
    {
      title: 'Timed Matches',
      items: [
        'Each player has a set time (1-5 minutes) to complete their move',
        'Timer resets after each successful move',
        'If a player runs out of time, they lose the game',
      ],
    },
    {
      title: 'Match Format',
      items: [
        'Matches can be single game, best of 3, or best of 5',
        'Win = 1 point, Draw = 0.5 points, Loss = 0 points',
        'The player with the highest score at the end wins the match',
      ],
    },
    {
      title: 'Draw & Resignation',
      items: [
        'Either player can offer a draw during their turn',
        'The opponent can accept (both get 0.5 points) or reject',
        'A player can resign at any time, giving the opponent a win',
      ],
    },
    {
      title: 'Repetition Rule',
      items: [
        'If a player makes the same exact move 3 times consecutively, they lose',
        'This prevents infinite loops and stalling tactics',
      ],
    },
    {
      title: 'Standard Chess Rules',
      items: [
        'Castling is allowed when neither the king nor rook has moved',
        'En passant capture is available for one move after a pawn advances two squares',
        'Pawn promotion occurs when a pawn reaches the opposite end',
        'Stalemate (no legal moves, king not in check) is a draw',
        'Insufficient material (e.g., king vs king) is a draw',
        'Threefold repetition of position is a draw',
        'Fifty-move rule: 50 moves without pawn move or capture is a draw',
      ],
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Game Rules
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rules.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="font-semibold text-sm">{section.title}</h3>
              <ul className="space-y-1">
                {section.items.map((item, index) => (
                  <li 
                    key={index} 
                    className="text-sm text-muted-foreground flex gap-2"
                  >
                    <span className="text-primary">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <p className="text-sm text-muted-foreground">
            For complete official chess rules, refer to the International Chess Federation (FIDE).
          </p>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => window.open('https://www.fide.com/FIDE/handbook/LawsOfChess.pdf', '_blank')}
            data-testid="link-fide-rules"
          >
            FIDE Rules
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
