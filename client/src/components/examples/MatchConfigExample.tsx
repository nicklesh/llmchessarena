import { useState } from 'react';
import MatchConfig from '../MatchConfig';

export default function MatchConfigExample() {
  const [matchGames, setMatchGames] = useState<1 | 3 | 5>(1);
  const [timedMatch, setTimedMatch] = useState(true);
  const [moveTimeLimit, setMoveTimeLimit] = useState(60);

  return (
    <div className="p-4">
      <MatchConfig
        matchGames={matchGames}
        onMatchGamesChange={setMatchGames}
        timedMatch={timedMatch}
        onTimedMatchChange={setTimedMatch}
        moveTimeLimit={moveTimeLimit}
        onMoveTimeLimitChange={setMoveTimeLimit}
      />
    </div>
  );
}
