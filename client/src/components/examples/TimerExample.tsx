import { useState } from 'react';
import Timer from '../Timer';

export default function TimerExample() {
  const [activeTimer, setActiveTimer] = useState<'white' | 'black'>('white');

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-4 justify-center">
        <Timer
          initialTime={60}
          isActive={activeTimer === 'white'}
          onTimeout={() => console.log('White timed out!')}
          side="white"
        />
        <Timer
          initialTime={60}
          isActive={activeTimer === 'black'}
          onTimeout={() => console.log('Black timed out!')}
          side="black"
        />
      </div>
      <div className="text-center">
        <button 
          onClick={() => setActiveTimer(t => t === 'white' ? 'black' : 'white')}
          className="text-sm underline"
        >
          Switch active timer
        </button>
      </div>
    </div>
  );
}
