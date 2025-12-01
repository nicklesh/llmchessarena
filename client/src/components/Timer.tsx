import { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  initialTime: number;
  isActive: boolean;
  onTimeout: () => void;
  side: 'white' | 'black';
}

export default function Timer({ initialTime, isActive, onTimeout, side }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasTimedOut = useRef(false);

  useEffect(() => {
    setTimeRemaining(initialTime);
    hasTimedOut.current = false;
  }, [initialTime]);

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (!hasTimedOut.current) {
              hasTimedOut.current = true;
              setTimeout(() => onTimeout(), 0);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, onTimeout, timeRemaining]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining <= 10;

  const sideStyles = side === 'white' 
    ? 'bg-white text-gray-900 border-gray-300' 
    : 'bg-gray-900 text-white border-gray-700';

  return (
    <div 
      className={`
        flex items-center gap-2 px-4 py-2 rounded-md border-2 font-mono text-xl tabular-nums
        ${sideStyles}
        ${isActive ? 'ring-2 ring-primary' : ''}
        ${isLowTime && isActive ? 'animate-pulse bg-red-100 dark:bg-red-900/30 border-red-500' : ''}
      `}
      data-testid={`timer-${side}`}
    >
      <Clock className={`w-5 h-5 ${isLowTime && isActive ? 'text-red-500' : ''}`} />
      <span className={isLowTime && isActive ? 'text-red-600 dark:text-red-400 font-bold' : ''}>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
