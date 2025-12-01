import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface MatchConfigProps {
  matchGames: 1 | 3 | 5;
  onMatchGamesChange: (value: 1 | 3 | 5) => void;
  timedMatch: boolean;
  onTimedMatchChange: (value: boolean) => void;
  moveTimeLimit: number;
  onMoveTimeLimitChange: (value: number) => void;
  disabled?: boolean;
}

export default function MatchConfig({
  matchGames,
  onMatchGamesChange,
  timedMatch,
  onTimedMatchChange,
  moveTimeLimit,
  onMoveTimeLimitChange,
  disabled = false,
}: MatchConfigProps) {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Match Format</Label>
        <Select 
          value={matchGames.toString()} 
          onValueChange={(v) => onMatchGamesChange(parseInt(v) as 1 | 3 | 5)}
          disabled={disabled}
        >
          <SelectTrigger className="w-[140px]" data-testid="select-match-format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Game</SelectItem>
            <SelectItem value="3">Best of 3</SelectItem>
            <SelectItem value="5">Best of 5</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3 pb-0.5">
        <Switch 
          id="timed-match" 
          checked={timedMatch} 
          onCheckedChange={onTimedMatchChange}
          disabled={disabled}
          data-testid="switch-timed"
        />
        <Label htmlFor="timed-match" className="text-sm font-medium cursor-pointer">
          Timed Match
        </Label>
      </div>

      {timedMatch && (
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Time per Move</Label>
          <Select 
            value={moveTimeLimit.toString()} 
            onValueChange={(v) => onMoveTimeLimitChange(parseInt(v))}
            disabled={disabled}
          >
            <SelectTrigger className="w-[140px]" data-testid="select-time-limit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="60">1 minute</SelectItem>
              <SelectItem value="120">2 minutes</SelectItem>
              <SelectItem value="180">3 minutes</SelectItem>
              <SelectItem value="240">4 minutes</SelectItem>
              <SelectItem value="300">5 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
