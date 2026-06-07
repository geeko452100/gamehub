import { useReducer, useCallback, useEffect, useRef } from 'react';
import { gameReducer, initialGameState } from '../gameReducer';

export function useCardBattler() {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  const enemyTurnHandled = useRef(false);

  const handlePhaseTransition = useCallback(() => {
    if (gameState.gameOver) return;
    if (gameState.combatPhase === 'attack-phase') dispatch({ type: 'TOGGLE_PHASE' });
    else {
      dispatch({ type: 'END_PLAYER_TURN' });
      setTimeout(() => dispatch({ type: 'START_PLAYER_TURN' }), 2000);
    }
  }, [gameState.combatPhase, gameState.gameOver]);

  const startPlayerTurn = useCallback(() => {
    if (gameState.gameOver) return;
    dispatch({ type: 'START_PLAYER_TURN' });
  }, [gameState.gameOver]);

  const executeAttack = useCallback(() => {
    if (gameState.gameOver) return;
    dispatch({ type: 'EXECUTE_ATTACK' });
  }, [gameState.gameOver]);

  const executeDefense = useCallback(() => {
    if (gameState.gameOver) return;
    dispatch({ type: 'EXECUTE_DEFENSE' });
  }, [gameState.gameOver]);

  const unstageCard = useCallback((cardId) => {
    if (gameState.gameOver) return;
    dispatch({ type: 'UNSTAGE_CARD', payload: { cardId } });
  }, [gameState.gameOver]);

  useEffect(() => {
    if (gameState.gameOver || gameState.turnOwner !== 'enemy-turn') {
      enemyTurnHandled.current = false;
      return;
    }
    if (enemyTurnHandled.current) return;
    enemyTurnHandled.current = true;

    const timers = [];
    let offset = 600;

    timers.push(setTimeout(() => dispatch({ type: 'ENEMY_EXECUTE_ATTACK' }), offset));
    offset += 1000;
    timers.push(setTimeout(() => dispatch({ type: 'SET_PHASE', payload: { phase: 'defend-phase' } }), offset));
    offset += 300;
    timers.push(setTimeout(() => dispatch({ type: 'ENEMY_EXECUTE_DEFENSE' }), offset));
    offset += 1000;
    timers.push(setTimeout(() => dispatch({ type: 'SET_PHASE', payload: { phase: 'attack-phase' } }), offset));
    offset += 300;
    timers.push(setTimeout(() => dispatch({ type: 'START_PLAYER_TURN' }), offset));

    return () => timers.forEach(clearTimeout);
  }, [gameState.turnOwner, gameState.gameOver, dispatch]);

  const stageCard = useCallback((id) => {
    if (gameState.gameOver) return;
    dispatch({ type: 'STAGE_CARD', payload: { cardId: id } });
  }, [gameState.gameOver]);

  const resetGame = useCallback(() => dispatch({ type: 'RESET_GAME' }), []);

  return {
    gameState,
    stageCard,
    unstageCard,
    handlePhaseTransition,
    executeAttack,
    executeDefense,
    startPlayerTurn,
    resetGame
  };
}