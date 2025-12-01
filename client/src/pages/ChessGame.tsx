import { useState, useCallback, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import ChessBoard from '@/components/ChessBoard';
import PlayerSelect, { LLM_PLAYERS, type LLMPlayerId } from '@/components/PlayerSelect';
import MatchConfig from '@/components/MatchConfig';
import GameControls, { type GameStatus } from '@/components/GameControls';
import MoveNotation from '@/components/MoveNotation';
import Timer from '@/components/Timer';
import Scorecard, { type GameResult } from '@/components/Scorecard';
import SelectedPlayers from '@/components/SelectedPlayers';
import DrawOfferDialog from '@/components/DrawOfferDialog';
import GameRules from '@/components/GameRules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown } from 'lucide-react';

interface MoveRecord {
  number: number;
  notation: string;
  time?: number;
}

export default function ChessGame() {
  const [whitePlayer, setWhitePlayer] = useState<LLMPlayerId | ''>('');
  const [blackPlayer, setBlackPlayer] = useState<LLMPlayerId | ''>('');
  const [matchGames, setMatchGames] = useState<1 | 3 | 5>(1);
  const [timedMatch, setTimedMatch] = useState(true);
  const [moveTimeLimit, setMoveTimeLimit] = useState(60);

  const [game, setGame] = useState(new Chess());
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  const [whiteMoves, setWhiteMoves] = useState<MoveRecord[]>([]);
  const [blackMoves, setBlackMoves] = useState<MoveRecord[]>([]);
  const [currentMoveNumber, setCurrentMoveNumber] = useState(1);

  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [currentGameNumber, setCurrentGameNumber] = useState(1);

  const [drawOffer, setDrawOffer] = useState<{ by: 'w' | 'b' } | null>(null);

  const [whiteTimerKey, setWhiteTimerKey] = useState(0);
  const [blackTimerKey, setBlackTimerKey] = useState(0);

  const moveStartTimeRef = useRef<number>(0);
  const consecutiveMovesRef = useRef<{ white: string[]; black: string[] }>({ white: [], black: [] });

  const whitePlayerName = LLM_PLAYERS.find(p => p.id === whitePlayer)?.name || 'White';
  const blackPlayerName = LLM_PLAYERS.find(p => p.id === blackPlayer)?.name || 'Black';

  const canStart = whitePlayer !== '' && blackPlayer !== '' && gameStatus === 'idle';
  const currentTurn = game.turn();

  const matchComplete = gameResults.length === matchGames;

  const resetTimers = useCallback(() => {
    setWhiteTimerKey(k => k + 1);
    setBlackTimerKey(k => k + 1);
  }, []);

  const startNewGame = useCallback(() => {
    setGame(new Chess());
    setGameStatus('idle');
    setLastMove(null);
    setWhiteMoves([]);
    setBlackMoves([]);
    setCurrentMoveNumber(1);
    setDrawOffer(null);
    consecutiveMovesRef.current = { white: [], black: [] };
    resetTimers();
  }, [resetTimers]);

  const startNewMatch = useCallback(() => {
    setGameResults([]);
    setCurrentGameNumber(1);
    startNewGame();
    setWhitePlayer('');
    setBlackPlayer('');
  }, [startNewGame]);

  const endGame = useCallback((result: 'white' | 'black' | 'draw', reason: string) => {
    setGameResults(prev => [...prev, {
      gameNumber: currentGameNumber,
      result,
      reason,
    }]);
    setGameStatus('finished');
    setCurrentGameNumber(prev => prev + 1);
  }, [currentGameNumber]);

  const checkThreefoldRepetition = useCallback((moveNotation: string, side: 'white' | 'black') => {
    const moves = side === 'white' ? consecutiveMovesRef.current.white : consecutiveMovesRef.current.black;
    moves.push(moveNotation);
    
    if (moves.length > 3) {
      moves.shift();
    }

    if (moves.length === 3 && moves[0] === moves[1] && moves[1] === moves[2]) {
      return true;
    }
    return false;
  }, []);

  const handleMove = useCallback((from: string, to: string, promotion?: string) => {
    if (gameStatus !== 'playing') return;

    const gameCopy = new Chess(game.fen());
    try {
      const move = gameCopy.move({ from, to, promotion });
      if (!move) return;

      const moveTime = timedMatch 
        ? Math.round((Date.now() - moveStartTimeRef.current) / 1000)
        : undefined;

      const side = currentTurn === 'w' ? 'white' : 'black';

      if (checkThreefoldRepetition(move.san, side)) {
        const winner = side === 'white' ? 'black' : 'white';
        endGame(winner, `${side === 'white' ? whitePlayerName : blackPlayerName} made same move 3 times`);
        return;
      }

      setGame(gameCopy);
      setLastMove({ from, to });

      if (currentTurn === 'w') {
        setWhiteMoves(prev => [...prev, { number: currentMoveNumber, notation: move.san, time: moveTime }]);
      } else {
        setBlackMoves(prev => [...prev, { number: currentMoveNumber, notation: move.san, time: moveTime }]);
        setCurrentMoveNumber(prev => prev + 1);
      }

      if (timedMatch) {
        if (currentTurn === 'w') {
          setBlackTimerKey(k => k + 1);
        } else {
          setWhiteTimerKey(k => k + 1);
        }
        moveStartTimeRef.current = Date.now();
      }

      if (gameCopy.isCheckmate()) {
        const winner = currentTurn === 'w' ? 'white' : 'black';
        endGame(winner, 'Checkmate');
      } else if (gameCopy.isStalemate()) {
        endGame('draw', 'Stalemate');
      } else if (gameCopy.isThreefoldRepetition()) {
        endGame('draw', 'Threefold Repetition');
      } else if (gameCopy.isInsufficientMaterial()) {
        endGame('draw', 'Insufficient Material');
      } else if (gameCopy.isDraw()) {
        endGame('draw', 'Draw (50-move rule)');
      }

    } catch (e) {
      console.log('Invalid move');
    }
  }, [game, gameStatus, currentTurn, currentMoveNumber, timedMatch, checkThreefoldRepetition, endGame, whitePlayerName, blackPlayerName]);

  const handleStart = useCallback(() => {
    if (matchComplete) {
      startNewMatch();
    } else {
      startNewGame();
      setGameStatus('playing');
      moveStartTimeRef.current = Date.now();
    }
  }, [matchComplete, startNewMatch, startNewGame]);

  const handlePause = useCallback(() => {
    setGameStatus('paused');
  }, []);

  const handleResume = useCallback(() => {
    setGameStatus('playing');
    moveStartTimeRef.current = Date.now();
  }, []);

  const handleResign = useCallback(() => {
    const winner = currentTurn === 'w' ? 'black' : 'white';
    endGame(winner, `${currentTurn === 'w' ? whitePlayerName : blackPlayerName} Resigned`);
  }, [currentTurn, whitePlayerName, blackPlayerName, endGame]);

  const handleOfferDraw = useCallback(() => {
    setDrawOffer({ by: currentTurn });
  }, [currentTurn]);

  const handleAcceptDraw = useCallback(() => {
    endGame('draw', 'Draw by Agreement');
    setDrawOffer(null);
  }, [endGame]);

  const handleRejectDraw = useCallback(() => {
    setDrawOffer(null);
  }, []);

  const handleTimeout = useCallback((side: 'white' | 'black') => {
    if (gameStatus !== 'playing') return;
    const winner = side === 'white' ? 'black' : 'white';
    endGame(winner, `${side === 'white' ? whitePlayerName : blackPlayerName} ran out of time`);
  }, [gameStatus, whitePlayerName, blackPlayerName, endGame]);

  const isPlaying = gameStatus === 'playing';
  const isWhiteTurn = currentTurn === 'w';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Crown className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Chess Battle Arena</h1>
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">AI vs AI Chess Matches</p>
        </header>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Game Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PlayerSelect
                label="Player 1 (White)"
                value={whitePlayer}
                onChange={setWhitePlayer}
                side="white"
                disabled={gameStatus !== 'idle' && gameStatus !== 'finished'}
                excludePlayer={blackPlayer || undefined}
              />
              <PlayerSelect
                label="Player 2 (Black)"
                value={blackPlayer}
                onChange={setBlackPlayer}
                side="black"
                disabled={gameStatus !== 'idle' && gameStatus !== 'finished'}
                excludePlayer={whitePlayer || undefined}
              />
            </div>

            <MatchConfig
              matchGames={matchGames}
              onMatchGamesChange={setMatchGames}
              timedMatch={timedMatch}
              onTimedMatchChange={setTimedMatch}
              moveTimeLimit={moveTimeLimit}
              onMoveTimeLimitChange={setMoveTimeLimit}
              disabled={gameStatus !== 'idle' && gameStatus !== 'finished'}
            />

            {(whitePlayer || blackPlayer) && (
              <SelectedPlayers whitePlayer={whitePlayer} blackPlayer={blackPlayer} />
            )}

            <GameControls
              status={matchComplete ? 'finished' : gameStatus}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onResign={handleResign}
              onOfferDraw={handleOfferDraw}
              canStart={canStart}
              currentTurn={currentTurn}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="w-full lg:w-[240px] xl:w-[280px] shrink-0 space-y-4">
            {timedMatch && gameStatus !== 'idle' && (
              <div className="flex justify-center">
                <Timer
                  key={`white-${whiteTimerKey}`}
                  initialTime={moveTimeLimit}
                  isActive={isPlaying && isWhiteTurn}
                  onTimeout={() => handleTimeout('white')}
                  side="white"
                />
              </div>
            )}
            <div className="h-[300px] lg:h-[450px]">
              <MoveNotation
                moves={whiteMoves}
                side="white"
                playerName={whitePlayerName}
                currentMoveIndex={whiteMoves.length - 1}
              />
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-[500px]">
              <ChessBoard
                game={game}
                onMove={handleMove}
                disabled={gameStatus !== 'playing'}
                lastMove={lastMove}
              />
              <div className="mt-2 text-center text-sm text-muted-foreground">
                {gameStatus === 'idle' && 'Select players and click Start to begin'}
                {gameStatus === 'playing' && `${isWhiteTurn ? whitePlayerName : blackPlayerName}'s turn`}
                {gameStatus === 'paused' && 'Game paused'}
                {gameStatus === 'finished' && 'Game over'}
                {game.isCheck() && gameStatus === 'playing' && ' - Check!'}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[240px] xl:w-[280px] shrink-0 space-y-4">
            {timedMatch && gameStatus !== 'idle' && (
              <div className="flex justify-center">
                <Timer
                  key={`black-${blackTimerKey}`}
                  initialTime={moveTimeLimit}
                  isActive={isPlaying && !isWhiteTurn}
                  onTimeout={() => handleTimeout('black')}
                  side="black"
                />
              </div>
            )}
            <div className="h-[300px] lg:h-[450px]">
              <MoveNotation
                moves={blackMoves}
                side="black"
                playerName={blackPlayerName}
                currentMoveIndex={blackMoves.length - 1}
              />
            </div>
          </div>
        </div>

        <Scorecard
          whitePlayer={whitePlayerName}
          blackPlayer={blackPlayerName}
          results={gameResults}
          totalGames={matchGames}
        />

        <GameRules />

        <DrawOfferDialog
          open={drawOffer !== null}
          offeringPlayer={drawOffer?.by === 'w' ? whitePlayerName : blackPlayerName}
          respondingPlayer={drawOffer?.by === 'w' ? blackPlayerName : whitePlayerName}
          onAccept={handleAcceptDraw}
          onReject={handleRejectDraw}
        />
      </div>
    </div>
  );
}
