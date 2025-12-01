import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const LLM_PLAYERS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'Google' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'grok-4', name: 'Grok 4', provider: 'xAI' },
  { id: 'gpt-5', name: 'GPT-5', provider: 'OpenAI' },
  { id: 'kimi-k2', name: 'Kimi K2', provider: 'Moonshot' },
  { id: 'deepseek-v3', name: 'DeepSeek-V3', provider: 'DeepSeek' },
] as const;

export type LLMPlayerId = typeof LLM_PLAYERS[number]['id'];

interface PlayerSelectProps {
  label: string;
  value: LLMPlayerId | 'human' | '';
  onChange: (value: LLMPlayerId | 'human', humanName?: string) => void;
  side: 'white' | 'black';
  disabled?: boolean;
  excludePlayer?: LLMPlayerId | 'human';
  humanName?: string;
}

export default function PlayerSelect({ 
  label, 
  value, 
  onChange, 
  side, 
  disabled = false,
  excludePlayer,
  humanName = ''
}: PlayerSelectProps) {
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [tempName, setTempName] = useState(humanName);

  const sideColor = side === 'white' ? 'bg-white text-gray-900' : 'bg-gray-900 text-white';
  
  const handleSelectChange = (v: string) => {
    if (v === 'human') {
      setTempName(humanName);
      setShowNameDialog(true);
    } else {
      onChange(v as LLMPlayerId);
    }
  };

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      onChange('human', tempName.trim());
      setShowNameDialog(false);
    }
  };

  const displayValue = value === 'human' ? `Human (${humanName})` : value;
  
  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded-sm border border-border ${sideColor}`} />
          <Label className="text-sm font-medium">{label}</Label>
        </div>
        <Select 
          value={value || ''} 
          onValueChange={handleSelectChange}
          disabled={disabled}
        >
          <SelectTrigger 
            className="w-full" 
            data-testid={`select-player-${side}`}
          >
            <SelectValue placeholder="Select player..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              value="human"
              data-testid="option-human"
            >
              <span className="font-medium">Human Player</span>
            </SelectItem>
            {LLM_PLAYERS.filter(p => p.id !== excludePlayer).map((player) => (
              <SelectItem 
                key={player.id} 
                value={player.id}
                data-testid={`option-${player.id}`}
              >
                <span className="font-medium">{player.name}</span>
                <span className="text-muted-foreground ml-2 text-xs">({player.provider})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Your Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Your name..."
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tempName.trim()) {
                  handleNameSubmit();
                }
              }}
              autoFocus
              data-testid="input-player-name"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowNameDialog(false)}
                data-testid="button-cancel-name"
              >
                Cancel
              </Button>
              <Button
                onClick={handleNameSubmit}
                disabled={!tempName.trim()}
                data-testid="button-confirm-name"
              >
                Play as {tempName || 'Player'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
