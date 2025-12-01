import { useState } from 'react';
import PlayerSelect, { type LLMPlayerId } from '../PlayerSelect';

export default function PlayerSelectExample() {
  const [white, setWhite] = useState<LLMPlayerId | ''>('');
  const [black, setBlack] = useState<LLMPlayerId | ''>('');

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-4">
      <div className="flex-1">
        <PlayerSelect
          label="Player 1 (White)"
          value={white}
          onChange={setWhite}
          side="white"
          excludePlayer={black || undefined}
        />
      </div>
      <div className="flex-1">
        <PlayerSelect
          label="Player 2 (Black)"
          value={black}
          onChange={setBlack}
          side="black"
          excludePlayer={white || undefined}
        />
      </div>
    </div>
  );
}
