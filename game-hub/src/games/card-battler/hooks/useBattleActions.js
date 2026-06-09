import { useCallback } from 'react';

/**
 * Provides all player interaction handlers for the battle screen.
 * Stateless — derives everything from gameState on every render.
 */
export function useBattleActions({
  gameState,
  currentUserId,
  stageCard,
  unstageCard,
  handlePhaseTransition,
  executeAttack,
  executeDefense,
  setConfirmPhaseOpen,
  setEnemyShake,
  showAttackBanner,
  showDefenseBanner,
}) {
  const isPlayerTurn = String(gameState?.turnOwner) === String(currentUserId);

  // ── Card play ─────────────────────────────────────────────────────────────
  const handlePlayCard = useCallback((instanceId) => {
    if (!gameState) return;

    // BUG FIX: Search by instanceId, not id. Multiple cards of the same type
    // share the same `id`; instanceId is the unique per-instance key used
    // throughout pvpLogic. Using `id` here caused wrong-card staging when
    // the hand contained duplicate card types.
    const card = gameState.player.hand.find((c) => c.instanceId === instanceId);
    if (!card) return;

    if (card.attack > 0) {
      setEnemyShake(true);
      setTimeout(() => setEnemyShake(false), 500);
    }

    stageCard(instanceId);
  }, [gameState, stageCard, setEnemyShake]);

  // ── Execute attack or defense ─────────────────────────────────────────────
  const handleExecuteAction = useCallback(() => {
    if (!gameState || !isPlayerTurn) return;

    const { combatPhase, player } = gameState;
    const staged = player.staged ?? [];

    if (combatPhase === 'attack-phase') {
      const totalAttack = staged
        .filter((c) => c.type === 'attack')
        .reduce((sum, c) => sum + c.attack, 0);
      showAttackBanner('Attack Launched!', `${totalAttack} damage unleashed.`);
      executeAttack();
    } else {
      const totalDefense = staged
        .filter((c) => c.type === 'defend')
        .reduce((sum, c) => sum + c.defense, 0);
      showDefenseBanner('Defense Matrix Raised!', `${totalDefense} block generated.`);
      executeDefense();
    }
  }, [gameState, isPlayerTurn, executeAttack, executeDefense, showAttackBanner, showDefenseBanner]);

  // ── Drag-and-drop ─────────────────────────────────────────────────────────
  const handleDragStart = useCallback((instanceId, location) => (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ cardId: instanceId, from: location }));
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleSlotDrop = useCallback((e) => {
    e.preventDefault();
    if (!isPlayerTurn) return;
    try {
      const { cardId, from } = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (from === 'hand') handlePlayCard(cardId);
    } catch (err) {
      console.error('handleSlotDrop: malformed drag payload', err);
    }
  }, [isPlayerTurn, handlePlayCard]);

  const handleHandDrop = useCallback((e) => {
    e.preventDefault();
    if (!isPlayerTurn) return;
    try {
      const { cardId, from } = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (from === 'stage') unstageCard(cardId);
    } catch (err) {
      console.error('handleHandDrop: malformed drag payload', err);
    }
  }, [isPlayerTurn, unstageCard]);

  // ── Phase transition with confirmation gate ───────────────────────────────
  const handlePhaseTransitionWithPrompt = useCallback(() => {
    if (gameState?.gameOver) return;
    setConfirmPhaseOpen(true);
  }, [gameState?.gameOver, setConfirmPhaseOpen]);

  const confirmPhaseTransition = useCallback(() => {
    setConfirmPhaseOpen(false);
    handlePhaseTransition();
  }, [handlePhaseTransition, setConfirmPhaseOpen]);

  const cancelPhaseTransition = useCallback(() => {
    setConfirmPhaseOpen(false);
  }, [setConfirmPhaseOpen]);

  // ── Derived display values ────────────────────────────────────────────────
  const gameFinished = gameState?.gameOver ?? null;

  const phaseButtonLabel = gameState?.combatPhase === 'attack-phase'
    ? 'To Defend Phase'
    : 'End Turn';

  const phasePromptMessage = gameState?.combatPhase === 'attack-phase'
    ? 'Are you ready to transition to the Defense Phase?'
    : 'Are you sure you want to end your turn?';

  const staged = gameState?.player?.staged ?? [];
  const actionReady = isPlayerTurn && (
    (gameState?.combatPhase === 'attack-phase'  && staged.some((c) => c.type === 'attack'))  ||
    (gameState?.combatPhase === 'defense-phase' && staged.some((c) => c.type === 'defend'))
  );

  const actionLabel = !isPlayerTurn
    ? gameState?.combatPhase === 'attack-phase'
      ? 'Attack (Not Your Turn)'
      : 'Defend (Not Your Turn)'
    : gameState?.combatPhase === 'attack-phase'
      ? actionReady ? 'Attack'  : 'No Attack Cards'
      : actionReady ? 'Defend'  : 'No Defense Cards';

  return {
    actionReady,
    actionLabel,
    phaseButtonLabel,
    phasePromptMessage,
    handlePlayCard,
    handleExecuteAction,
    handleDragStart,
    handleDragOver,
    handleSlotDrop,
    handleHandDrop,
    handlePhaseTransitionWithPrompt,
    confirmPhaseTransition,
    cancelPhaseTransition,
    gameFinished,
  };
}
