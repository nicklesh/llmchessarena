import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

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
  value: LLMPlayerId | '';
  onChange: (value: LLMPlayerId) => void;
  side: 'white' | 'black';
  disabled?: boolean;
  excludePlayer?: LLMPlayerId;
}

export default function PlayerSelect({ 
  label, 
  value, 
  onChange, 
  side, 
  disabled = false,
  excludePlayer 
}: PlayerSelectProps) {
  const sideColor = side === 'white' ? 'bg-white text-gray-900' : 'bg-gray-900 text-white';
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded-sm border border-border ${sideColor}`} />
        <Label className="text-sm font-medium">{label}</Label>
      </div>
      <Select 
        value={value} 
        onValueChange={(v) => onChange(v as LLMPlayerId)}
        disabled={disabled}
      >
        <SelectTrigger 
          className="w-full" 
          data-testid={`select-player-${side}`}
        >
          <SelectValue placeholder="Select AI model..." />
        </SelectTrigger>
        <SelectContent>
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
  );
}
