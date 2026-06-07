import { useCallback } from 'react';

export function useBattleActions({
  gameState,
  stageCard,
  unstageCard,
  handlePhaseTransition,
  executeAttack,
  executeDefense,
  setConfirmPhaseOpen,
  setEnemyShake,
  showAttackBanner,
  showDefenseBanner
}) {
  const handlePlayCard = useCallback((cardId) => {
    const card = gameState.player.hand.find((item) => item.id === cardId);
    if (!card) return;

    if (card.attack > 0) {
      setEnemyShake(true);
      setTimeout(() => setEnemyShake(false), 500);
    }

    stageCard(cardId);
  }, [gameState.player.hand, stageCard, setEnemyShake]);

  const handleExecuteAction = useCallback(() => {
    const activePhase = gameState.combatPhase;
    const staged = gameState.player.staged;
    const isPlayerTurn = gameState.turnOwner === 'player-turn';
    if (!isPlayerTurn) return;

    if (activePhase === 'attack-phase') {
      const totalAttack = staged.filter((card) => card.type === 'attack').reduce((sum, card) => sum + card.attack, 0);
      showAttackBanner('Attack Launched!', `${totalAttack} damage unleashed.`);
      executeAttack();
    } else {
      const totalDefense = staged.filter((card) => card.type === 'defend').reduce((sum, card) => sum + card.defense, 0);
      showDefenseBanner('Shield Up!', `${totalDefense} block gained.`);
      executeDefense();
    }
  }, [executeAttack, executeDefense, gameState.combatPhase, gameState.player.staged, gameState.turnOwner, showAttackBanner, showDefenseBanner]);

  const handleDragStart = useCallback((cardId, source) => (e) => {
    e.dataTransfer.setData('cardId', cardId);
    e.dataTransfer.setData('source', source);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleSlotDrop = useCallback((e) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    const source = e.dataTransfer.getData('source');
    if (!cardId) return;
    if (source === 'hand') stageCard(cardId);
    if (source === 'stage') unstageCard(cardId);
  }, [stageCard, unstageCard]);

  const handleHandDrop = useCallback((e) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    const source = e.dataTransfer.getData('source');
    if (source === 'stage' && cardId) unstageCard(cardId);
  }, [unstageCard]);

  const phaseButtonLabel = gameState.combatPhase === 'attack-phase' ? 'Switch to Defense Phase' : 'End Player Turn';
  const phasePromptMessage = gameState.combatPhase === 'attack-phase'
    ? 'Are you sure you want to switch to the defense phase?'
    : 'Are you sure you want to end your turn?';

  const actionReady = gameState.turnOwner === 'player-turn' && ((gameState.combatPhase === 'attack-phase' && gameState.player.staged.some((card) => card.type === 'attack')) || (gameState.combatPhase === 'defend-phase' && gameState.player.staged.some((card) => card.type === 'defend')));
  const actionLabel = gameState.turnOwner !== 'player-turn'
    ? gameState.combatPhase === 'attack-phase'
      ? 'Attack (Not Your Turn)'
      : 'Defend (Not Your Turn)'
    : gameState.combatPhase === 'attack-phase'
      ? actionReady
        ? 'Attack'
        : 'No Attack Cards'
      : actionReady
        ? 'Defend'
        : 'No Defense Cards';

  const handlePhaseTransitionWithPrompt = useCallback(() => {
    if (gameState.gameOver) return;
    setConfirmPhaseOpen(true);
  }, [gameState.gameOver, setConfirmPhaseOpen]);

  const confirmPhaseTransition = useCallback(() => {
    setConfirmPhaseOpen(false);
    handlePhaseTransition();
  }, [handlePhaseTransition, setConfirmPhaseOpen]);

  const cancelPhaseTransition = useCallback(() => {
    setConfirmPhaseOpen(false);
  }, [setConfirmPhaseOpen]);

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
    cancelPhaseTransition
  };
}
