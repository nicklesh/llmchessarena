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
import { Badge } from '@/components/ui/badge';
import { Crown, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface MoveRecord {
  number: number;
  notation: string;
  time?: number;
}

export default function ChessGame() {
  const [whitePlayer, setWhitePlayer] = useState<LLMPlayerId | 'human' | ''>('');
  const [blackPlayer, setBlackPlayer] = useState<LLMPlayerId | 'human' | ''>('');
  const [humanWhiteName, setHumanWhiteName] = useState('');
  const [humanBlackName, setHumanBlackName] = useState('');
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

  const [isThinking, setIsThinking] = useState(false);
  const [thinkingPlayer, setThinkingPlayer] = useState<'white' | 'black' | null>(null);

  const moveStartTimeRef = useRef<number>(0);
  const consecutiveMovesRef = useRef<{ white: string[]; black: string[] }>({ white: [], black: [] });
  const moveHistoryRef = useRef<string[]>([]);
  const isRequestingMoveRef = useRef(false);

  const currentTurn = game.turn();

  const isHumanWhite = whitePlayer === 'human';
  const isHumanBlack = blackPlayer === 'human';
  const isHumanTurn = (currentTurn === 'w' && isHumanWhite) || (currentTurn === 'b' && isHumanBlack);

  const whitePlayerName = isHumanWhite ? humanWhiteName : LLM_PLAYERS.find(p => p.id === whitePlayer)?.name || 'White';
  const blackPlayerName = isHumanBlack ? humanBlackName : LLM_PLAYERS.find(p => p.id === blackPlayer)?.name || 'Black';

  const canStart = whitePlayer !== '' && blackPlayer !== '' && gameStatus === 'idle';

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
    setIsThinking(false);
    setThinkingPlayer(null);
    consecutiveMovesRef.current = { white: [], black: [] };
    moveHistoryRef.current = [];
    isRequestingMoveRef.current = false;
    resetTimers();
  }, [resetTimers]);

  const startNewMatch = useCallback(() => {
    setGameResults([]);
    setCurrentGameNumber(1);
    startNewGame();
    setWhitePlayer('');
    setBlackPlayer('');
    setHumanWhiteName('');
    setHumanBlackName('');
  }, [startNewGame]);

  const endGame = useCallback((result: 'white' | 'black' | 'draw', reason: string) => {
    setGameResults(prev => [...prev, {
      gameNumber: currentGameNumber,
      result,
      reason,
    }]);
    setGameStatus('finished');
    setCurrentGameNumber(prev => prev + 1);
    setIsThinking(false);
    setThinkingPlayer(null);
    isRequestingMoveRef.current = false;
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

  const applyMove = useCallback((from: string, to: string, promotion?: string) => {
    const gameCopy = new Chess(game.fen());
    try {
      const move = gameCopy.move({ from, to, promotion });
      if (!move) return false;

      const moveTime = timedMatch 
        ? Math.round((Date.now() - moveStartTimeRef.current) / 1000)
        : undefined;

      const side = currentTurn === 'w' ? 'white' : 'black';
      const turnForMove = currentTurn;

      if (checkThreefoldRepetition(move.san, side)) {
        const winner = side === 'white' ? 'black' : 'white';
        endGame(winner, `${side === 'white' ? whitePlayerName : blackPlayerName} made same move 3 times`);
        return true;
      }

      moveHistoryRef.current.push(`${from}${to}${promotion || ''}`);
      setGame(gameCopy);
      setLastMove({ from, to });

      if (turnForMove === 'w') {
        setWhiteMoves(prev => [...prev, { number: currentMoveNumber, notation: move.san, time: moveTime }]);
      } else {
        setBlackMoves(prev => [...prev, { number: currentMoveNumber, notation: move.san, time: moveTime }]);
        setCurrentMoveNumber(prev => prev + 1);
      }

      if (timedMatch) {
        if (turnForMove === 'w') {
          setBlackTimerKey(k => k + 1);
        } else {
          setWhiteTimerKey(k => k + 1);
        }
        moveStartTimeRef.current = Date.now();
      }

      if (gameCopy.isCheckmate()) {
        const winner = turnForMove === 'w' ? 'white' : 'black';
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

      return true;
    } catch (e) {
      console.log('Invalid move:', e);
      return false;
    }
  }, [game, currentTurn, currentMoveNumber, timedMatch, checkThreefoldRepetition, endGame, whitePlayerName, blackPlayerName]);

  const handleMove = useCallback((from: string, to: string, promotion?: string) => {
    if (gameStatus !== 'playing') return;
    
    // Only allow manual moves for human players
    const isHumanTurn = (currentTurn === 'w' && isHumanWhite) || (currentTurn === 'b' && isHumanBlack);
    if (isHumanTurn) {
      applyMove(from, to, promotion);
    }
  }, [gameStatus, currentTurn, isHumanWhite, isHumanBlack, applyMove]);

  const fetchAIMove = useCallback(async () => {
    if (isRequestingMoveRef.current) return;
    if (gameStatus !== 'playing') return;

    // Skip if it's a human player's turn
    const isHumanTurn = (currentTurn === 'w' && isHumanWhite) || (currentTurn === 'b' && isHumanBlack);
    if (isHumanTurn) return;

    const currentPlayer = currentTurn === 'w' ? whitePlayer : blackPlayer;
    if (!currentPlayer || currentPlayer === 'human') return;

    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return;

    const legalMoves = moves.map(m => `${m.from}${m.to}${m.promotion || ''}`);

    isRequestingMoveRef.current = true;
    setIsThinking(true);
    setThinkingPlayer(currentTurn === 'w' ? 'white' : 'black');

    try {
      const response = await apiRequest('POST', '/api/chess/move', {
        playerId: currentPlayer,
        fen: game.fen(),
        legalMoves,
        moveHistory: moveHistoryRef.current,
      });

      const data = await response.json();

      if (gameStatus !== 'playing') {
        isRequestingMoveRef.current = false;
        setIsThinking(false);
        setThinkingPlayer(null);
        return;
      }

      if (data.move) {
        const from = data.move.slice(0, 2);
        const to = data.move.slice(2, 4);
        const promotion = data.move.length > 4 ? data.move[4] : undefined;

        applyMove(from, to, promotion);
      }
    } catch (error) {
      console.error('Failed to get AI move:', error);
      const moves = game.moves({ verbose: true });
      if (moves.length > 0) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        applyMove(randomMove.from, randomMove.to, randomMove.promotion);
      }
    } finally {
      isRequestingMoveRef.current = false;
      setIsThinking(false);
      setThinkingPlayer(null);
    }
  }, [gameStatus, currentTurn, whitePlayer, blackPlayer, isHumanWhite, isHumanBlack, game, applyMove]);

  useEffect(() => {
    if (gameStatus === 'playing' && !isRequestingMoveRef.current) {
      const timer = setTimeout(() => {
        fetchAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, game.fen(), fetchAIMove]);

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
  const boardDisabled = gameStatus !== 'playing' || (isThinking && !isHumanTurn);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <Crown className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Chess Battle Arena</h1>
            <Crown className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">AI vs AI, Human vs AI, or Human vs Human Chess</p>
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
                onChange={(value, name) => {
                  setWhitePlayer(value);
                  if (value === 'human' && name) setHumanWhiteName(name);
                }}
                side="white"
                disabled={gameStatus !== 'idle' && gameStatus !== 'finished'}
                excludePlayer={blackPlayer || undefined}
                humanName={humanWhiteName}
              />
              <PlayerSelect
                label="Player 2 (Black)"
                value={blackPlayer}
                onChange={(value, name) => {
                  setBlackPlayer(value);
                  if (value === 'human' && name) setHumanBlackName(name);
                }}
                side="black"
                disabled={gameStatus !== 'idle' && gameStatus !== 'finished'}
                excludePlayer={whitePlayer || undefined}
                humanName={humanBlackName}
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
              <SelectedPlayers 
                whitePlayer={whitePlayer as LLMPlayerId | ''} 
                blackPlayer={blackPlayer as LLMPlayerId | ''} 
              />
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
                  isActive={isPlaying && isWhiteTurn && !isThinking}
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
                disabled={boardDisabled}
                lastMove={lastMove}
              />
              <div className="mt-3 text-center">
                {gameStatus === 'idle' && (
                  <span className="text-sm text-muted-foreground">
                    Select players and click Start to begin
                  </span>
                )}
                {gameStatus === 'playing' && isThinking && thinkingPlayer && (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <Badge variant="secondary" className="animate-pulse">
                      {thinkingPlayer === 'white' ? whitePlayerName : blackPlayerName} is thinking...
                    </Badge>
                  </div>
                )}
                {gameStatus === 'playing' && !isThinking && (
                  <span className="text-sm text-muted-foreground">
                    {isWhiteTurn ? whitePlayerName : blackPlayerName}'s turn
                    {isHumanTurn && ' - Your move!'}
                    {game.isCheck() && ' - Check!'}
                  </span>
                )}
                {gameStatus === 'paused' && (
                  <Badge variant="secondary">Game paused</Badge>
                )}
                {gameStatus === 'finished' && (
                  <Badge variant="secondary">Game over</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[240px] xl:w-[280px] shrink-0 space-y-4">
            {timedMatch && gameStatus !== 'idle' && (
              <div className="flex justify-center">
                <Timer
                  key={`black-${blackTimerKey}`}
                  initialTime={moveTimeLimit}
                  isActive={isPlaying && !isWhiteTurn && !isThinking}
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
