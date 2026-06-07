// @ts-nocheck
import { useEffect, useRef } from 'react';
import GameOverModel from './components/GameOverModel';
import FieldGrid from './components/FieldGrid';
import PhaseConfirmModal from './components/PhaseConfirmModal';
import BattleHandZone from './components/BattleHandZone';
import BattleBanners from './components/BattleBanners';
import BattleDashboard from './components/BattleDashboard';
import BattleActionBar from './components/BattleActionBar';
import { useCardBattler } from './hooks/useCardBattler';
import { useBattleUI } from './hooks/useBattleUI';
import { ENEMY_DECK } from './cards';

export default function CardBattlerEngine() {
  const { gameState, stageCard, unstageCard, executeAttack, executeDefense, resetGame, dispatch } = useCardBattler();
  
  const { player, enemy, combatPhase, turnOwner } = gameState; 
  const isPlayerTurn = turnOwner === 'player-turn';
  const aiTimerRef = useRef(null);

  const { playerShake, enemyShake, confirmPhaseOpen, startingBanner, startingBannerSlidingOut, phaseBanner, phaseSlidingOut, attackBanner, attackBannerSlidingOut, defenseBanner, defenseBannerSlidingOut, enemyAttackBanner, enemyAttackBannerSlidingOut, enemyDefenseBanner, enemyDefenseBannerSlidingOut, gameFinished, phaseButtonLabel, phasePromptMessage, actionReady, actionLabel, handlePlayCard, handleExecuteAction, handleDragStart, handleDragOver, handleSlotDrop, handleHandDrop, handlePhaseTransitionWithPrompt, confirmPhaseTransition, cancelPhaseTransition } = useBattleUI({ 
    gameState, 
    stageCard, 
    unstageCard, 
    handlePhaseTransition: () => dispatch({ type: 'PLAYER_NEXT_PHASE' }), 
    executeAttack, 
    executeDefense, 
    resetGame 
  });
  
  const handleDiscardCard = (cardId) => {
    dispatch({ type: 'DISCARD_CARD', payload: { cardId } });
  };

  // ==========================================
  // ISOLATED AUTOMATED ENEMY AI LOOP
  // ==========================================
  useEffect(() => {
    if (isPlayerTurn || gameState.gameOver || !dispatch) return;

    clearTimeout(aiTimerRef.current);

    const getRandomEnemyCard = () => {
      const randomIndex = Math.floor(Math.random() * ENEMY_DECK.length);
      return ENEMY_DECK[randomIndex];
    };

    // Branch A: Enemy Attack Phase Loop
    if (combatPhase === 'attack-phase') {
      aiTimerRef.current = setTimeout(() => {
        if (!gameState.isFirstTurnOfGame) {
          const activeCard = getRandomEnemyCard();
          dispatch({ 
            type: 'ENEMY_EXECUTE_ATTACK', 
            payload: { damage: activeCard.attack || 5 } 
          });
        }
        dispatch({ type: 'ENEMY_NEXT_PHASE' });
      }, 1500);
    } 
    
    // Branch B: Enemy Defense Phase Loop
    else if (combatPhase === 'defense-phase') {
      aiTimerRef.current = setTimeout(() => {
        const activeCard = getRandomEnemyCard();
        dispatch({ 
          type: 'ENEMY_EXECUTE_DEFENSE',
          payload: { block: activeCard.defense || 4 } 
        });
        dispatch({ type: 'ENEMY_NEXT_PHASE' });
      }, 1500);
    }

    return () => clearTimeout(aiTimerRef.current);
  }, [turnOwner, combatPhase, isPlayerTurn, gameState.gameOver, gameState.isFirstTurnOfGame, dispatch]);

  useEffect(() => {
    if (!confirmPhaseOpen) {
      document.body.style.pointerEvents = 'auto';
    }
  }, [confirmPhaseOpen]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-white bg-slate-900 min-h-screen">
      <BattleBanners startingBanner={startingBanner} startingBannerSlidingOut={startingBannerSlidingOut} phaseBanner={phaseBanner} phaseSlidingOut={phaseSlidingOut} attackBanner={attackBanner} attackBannerSlidingOut={attackBannerSlidingOut} defenseBanner={defenseBanner} defenseBannerSlidingOut={defenseBannerSlidingOut} enemyAttackBanner={enemyAttackBanner} enemyAttackBannerSlidingOut={enemyAttackBannerSlidingOut} enemyDefenseBanner={enemyDefenseBanner} enemyDefenseBannerSlidingOut={enemyDefenseBannerSlidingOut} />
      <BattleDashboard player={player} enemy={enemy} playerShake={playerShake} enemyShake={enemyShake} />
      <FieldGrid stagedCards={player.staged} isPlayerTurn={isPlayerTurn} handleDragStart={handleDragStart} handleDragOver={handleDragOver} handleSlotDrop={handleSlotDrop} onUnstage={unstageCard} />
      
    <BattleHandZone 
      hand={player.hand} 
      isPlayerTurn={isPlayerTurn} 
      combatPhase={combatPhase} 
      playerEnergy={player.energy} 
      handlePlayCard={handlePlayCard} 
      handleDragStart={handleDragStart} 
      handleDragOver={handleDragOver} 
      handleHandDrop={handleHandDrop} 
      onDiscardCard={handleDiscardCard} 
    />
      
      {isPlayerTurn ? (
        <BattleActionBar combatPhase={combatPhase} gameFinished={gameFinished} actionReady={actionReady} phaseButtonLabel={phaseButtonLabel} actionLabel={actionLabel} handlePhaseTransitionWithPrompt={handlePhaseTransitionWithPrompt} handleExecuteAction={handleExecuteAction} />
      ) : (
        <div className="p-4 bg-slate-800 text-center rounded-lg border border-slate-700 animate-pulse text-amber-400 font-medium">
          Opponent is taking actions...
        </div>
      )}

      {confirmPhaseOpen && (
        <PhaseConfirmModal phasePromptMessage={phasePromptMessage} confirmPhaseTransition={confirmPhaseTransition} cancelPhaseTransition={cancelPhaseTransition} />
      )}
      <GameOverModel result={gameState.gameOver} onReset={resetGame} />
    </div>
  );
}