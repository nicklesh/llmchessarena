import { useState } from 'react';
import GameControls, { type GameStatus } from '../GameControls';

export default function GameControlsExample() {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [turn, setTurn] = useState<'w' | 'b'>('w');

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setStatus('idle')} className="text-xs underline">idle</button>
        <button onClick={() => setStatus('playing')} className="text-xs underline">playing</button>
        <button onClick={() => setStatus('paused')} className="text-xs underline">paused</button>
        <button onClick={() => setStatus('finished')} className="text-xs underline">finished</button>
        <button onClick={() => setTurn(t => t === 'w' ? 'b' : 'w')} className="text-xs underline">toggle turn</button>
      </div>
      <GameControls
        status={status}
        onStart={() => setStatus('playing')}
        onPause={() => setStatus('paused')}
        onResume={() => setStatus('playing')}
        onResign={() => { setStatus('finished'); console.log('Resigned'); }}
        onOfferDraw={() => console.log('Draw offered')}
        canStart={true}
        currentTurn={turn}
      />
    </div>
  );
}
