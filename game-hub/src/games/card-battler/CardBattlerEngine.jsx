import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import { useGameSync } from './hooks/useGameSync';
import { gameReducer } from './gameReducer';
import { initialGameState } from './initialState';

import GameOverModel     from './components/GameOverModel';
import FieldGrid         from './components/FieldGrid';
import PhaseConfirmModal from './components/PhaseConfirmModal';
import BattleHandZone    from './components/BattleHandZone';
import BattleBanners     from './components/BattleBanners';
import BattleDashboard   from './components/BattleDashboard';
import BattleActionBar   from './components/BattleActionBar';

import { useCardBattler } from './hooks/useCardBattler';
import { useBattleUI }    from './hooks/useBattleUI';

const EMPTY_PLAYER = { hp: 50, energy: 3, block: 0, hand: [], staged: [] };

function isGameInitialized(status) {
  return (
    status &&
    typeof status === 'object' &&
    Array.isArray(status.player_1?.hand) &&
    status.player_1.hand.length > 0
  );
}

export default function CardBattlerEngine({ gameId, currentUserId }) {
  const { gameState, localDispatch } = useCardBattler();
  const [loading, setLoading]   = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);
  const versionRef = useRef(0);
  const waitingForInitRef = useRef(false);

  const isPlayer1 = String(currentUserId) === String(gameState?.player_1_id);

  const player = isPlayer1
    ? (gameState?.player_1 ?? EMPTY_PLAYER)
    : (gameState?.player_2 ?? EMPTY_PLAYER);

  const enemy = isPlayer1
    ? (gameState?.player_2 ?? EMPTY_PLAYER)
    : (gameState?.player_1 ?? EMPTY_PLAYER);

  const isPlayerTurn = String(gameState?.turnOwner) === String(currentUserId);

  const normalizedGameState = gameState
    ? { ...gameState, player, enemy }
    : null;

  const applyRemoteState = useCallback((remoteState, remoteVersion) => {
    versionRef.current = remoteVersion ?? remoteState?.stateVersion ?? 0;
    localDispatch({ type: 'SYNC_FROM_SERVER', payload: remoteState });
    if (isGameInitialized(remoteState)) {
      waitingForInitRef.current = false;
      setLoading(false);
    }
  }, [localDispatch]);

  const syncAndBroadcast = useCallback(async (nextState) => {
    const expectedVersion = gameState?.stateVersion ?? 0;

    const { data, error } = await supabase
      .from('games')
      .update({
        status:        nextState,
        turn_owner:    nextState.turnOwner,
        state_version: nextState.stateVersion,
      })
      .eq('id', gameId)
      .eq('state_version', expectedVersion)
      .select('status, state_version');

    if (error) {
      console.error('syncAndBroadcast failed:', error);
      return;
    }

    if (!data?.length) {
      const { data: fresh, error: fetchError } = await supabase
        .from('games')
        .select('status, state_version')
        .eq('id', gameId)
        .single();

      if (!fetchError && fresh?.status) {
        applyRemoteState(fresh.status, fresh.state_version);
      }
      return;
    }

    versionRef.current = nextState.stateVersion;
  }, [gameId, gameState?.stateVersion, applyRemoteState]);

  const dispatchAndSync = useCallback((actionType, payload = {}) => {
    const action = { type: actionType, payload: { ...payload, userId: currentUserId } };
    const reduced = gameReducer(gameState, action);
    const next = {
      ...reduced,
      stateVersion: (gameState?.stateVersion ?? 0) + 1,
    };

    localDispatch({ type: 'SYNC_FROM_SERVER', payload: next });
    versionRef.current = next.stateVersion;
    syncAndBroadcast(next);
  }, [gameState, currentUserId, localDispatch, syncAndBroadcast]);

  const stageCardSynced    = useCallback((cardId) => dispatchAndSync('STAGE_CARD',    { cardId }), [dispatchAndSync]);
  const unstageCardSynced  = useCallback((cardId) => dispatchAndSync('UNSTAGE_CARD',  { cardId }), [dispatchAndSync]);
  const executeAttackSynced  = useCallback(() => dispatchAndSync('EXECUTE_ATTACK'),  [dispatchAndSync]);
  const executeDefenseSynced = useCallback(() => dispatchAndSync('EXECUTE_DEFENSE'), [dispatchAndSync]);
  const handlePhaseTransition = useCallback(() => dispatchAndSync('NEXT_PHASE'),     [dispatchAndSync]);
  const resetGameSynced = useCallback(() => {
    const reduced = gameReducer(gameState, { type: 'RESET_GAME' });
    const next = {
      ...reduced,
      stateVersion: (gameState?.stateVersion ?? 0) + 1,
    };
    localDispatch({ type: 'SYNC_FROM_SERVER', payload: next });
    versionRef.current = next.stateVersion;
    syncAndBroadcast(next);
  }, [gameState, localDispatch, syncAndBroadcast]);

  useEffect(() => {
    if (!gameId) return;

    let cancelled = false;

    const fetchInitialState = async () => {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('status, state_version, player_1_id, player_2_id')
          .eq('id', gameId)
          .single();

        if (cancelled || error || !data) return;

        const remoteVersion = data.state_version ?? data.status?.stateVersion ?? 0;

        if (isGameInitialized(data.status)) {
          applyRemoteState(data.status, remoteVersion);
          return;
        }

        const p1 = data.player_1_id ?? currentUserId;
        const p2 = data.player_2_id;
        const isSeeder =
          String(currentUserId) === String(data.player_1_id) || !data.player_1_id;

        if (isSeeder) {
          const fresh = gameReducer(
            { ...initialGameState, player_1_id: p1, player_2_id: p2 },
            { type: 'INITIALIZE_GAME', payload: { player1Id: p1, player2Id: p2 } }
          );
          const seeded = { ...fresh, stateVersion: 1 };

          localDispatch({ type: 'SYNC_FROM_SERVER', payload: seeded });
          versionRef.current = 1;

          const { data: written, error: writeError } = await supabase
            .from('games')
            .update({
              status:        seeded,
              turn_owner:    p1,
              state_version: 1,
            })
            .eq('id', gameId)
            .eq('state_version', remoteVersion)
            .select('status, state_version');

          if (writeError) {
            console.error('Failed to seed game state:', writeError);
          } else if (!written?.length) {
            const { data: freshRow } = await supabase
              .from('games')
              .select('status, state_version')
              .eq('id', gameId)
              .single();

            if (freshRow?.status) {
              applyRemoteState(freshRow.status, freshRow.state_version);
            }
          }

          setLoading(false);
        } else {
          waitingForInitRef.current = true;
        }
      } finally {
        if (!waitingForInitRef.current) {
          setLoading(false);
        }
      }
    };

    fetchInitialState();

    return () => { cancelled = true; };
  }, [gameId, currentUserId, localDispatch, applyRemoteState]);

  const handleRemoteUpdate = useCallback((initialized) => {
    if (initialized) setLoading(false);
  }, []);

  useGameSync(gameId, localDispatch, versionRef, handleRemoteUpdate);

  useEffect(() => {
    if (!waitingForInitRef.current || !gameId) return;

    const poll = setInterval(async () => {
      const { data } = await supabase
        .from('games')
        .select('status, state_version')
        .eq('id', gameId)
        .single();

      if (isGameInitialized(data?.status)) {
        applyRemoteState(data.status, data.state_version);
        clearInterval(poll);
      }
    }, 2000);

    return () => clearInterval(poll);
  }, [gameId, applyRemoteState]);

  const handleForceTurnSkip = useCallback(() => {
    if (!isPlayerTurn) return;
    dispatchAndSync('NEXT_PHASE');
  }, [isPlayerTurn, dispatchAndSync]);

  useEffect(() => {
    clearInterval(timerRef.current);

    if (!gameState?.turnExpiration || gameState?.gameOver) return;

    timerRef.current = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((gameState.turnExpiration - Date.now()) / 1000)
      );
      setTimeLeft(remaining);
      if (remaining <= 0 && isPlayerTurn) handleForceTurnSkip();
    }, 250);

    return () => clearInterval(timerRef.current);
  }, [gameState?.turnExpiration, gameState?.gameOver, isPlayerTurn, handleForceTurnSkip]);

  const {
    playerShake, enemyShake, confirmPhaseOpen,
    startingBanner, startingBannerSlidingOut,
    phaseBanner, phaseSlidingOut,
    attackBanner, attackBannerSlidingOut,
    defenseBanner, defenseBannerSlidingOut,
    enemyAttackBanner, enemyAttackBannerSlidingOut,
    enemyDefenseBanner, enemyDefenseBannerSlidingOut,
    gameFinished, phaseButtonLabel, phasePromptMessage,
    actionReady, actionLabel,
    handlePlayCard, handleExecuteAction,
    handleDragStart, handleDragOver, handleSlotDrop, handleHandDrop,
    handlePhaseTransitionWithPrompt, confirmPhaseTransition, cancelPhaseTransition,
  } = useBattleUI({
    gameState:            normalizedGameState,
    myUserId:             currentUserId,
    stageCard:            stageCardSynced,
    unstageCard:          unstageCardSynced,
    handlePhaseTransition,
    executeAttack:        executeAttackSynced,
    executeDefense:       executeDefenseSynced,
    resetGame:            resetGameSynced,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-amber-400 font-bold">
        Synchronizing...
      </div>
    );
  }

  if (!gameState) {
    return <div className="text-white">Connection Fault</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-white bg-slate-900 min-h-screen">
      <BattleBanners
        startingBanner={startingBanner}
        startingBannerSlidingOut={startingBannerSlidingOut}
        phaseBanner={phaseBanner}
        phaseSlidingOut={phaseSlidingOut}
        attackBanner={attackBanner}
        attackBannerSlidingOut={attackBannerSlidingOut}
        defenseBanner={defenseBanner}
        defenseBannerSlidingOut={defenseBannerSlidingOut}
        enemyAttackBanner={enemyAttackBanner}
        enemyAttackBannerSlidingOut={enemyAttackBannerSlidingOut}
        enemyDefenseBanner={enemyDefenseBanner}
        enemyDefenseBannerSlidingOut={enemyDefenseBannerSlidingOut}
      />

      <BattleDashboard
        localPlayer={player}
        remoteEnemy={enemy}
        playerShake={playerShake}
        enemyShake={enemyShake}
        isPlayerTurn={isPlayerTurn}
        combatPhase={gameState.combatPhase}
        timeLeft={timeLeft}
      />

      <FieldGrid
        stagedCards={player.staged}
        isPlayerTurn={isPlayerTurn}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleSlotDrop={handleSlotDrop}
        onUnstage={unstageCardSynced}
      />

      <BattleHandZone
        hand={player.hand}
        isPlayerTurn={isPlayerTurn}
        playerEnergy={player.energy}
        combatPhase={gameState.combatPhase}
        handlePlayCard={handlePlayCard}
        handleDragStart={handleDragStart}
        handleDragOver={handleDragOver}
        handleHandDrop={handleHandDrop}
      />

      <BattleActionBar
        combatPhase={gameState.combatPhase}
        gameFinished={gameFinished}
        actionReady={actionReady}
        actionLabel={actionLabel}
        phaseButtonLabel={phaseButtonLabel}
        handlePhaseTransitionWithPrompt={handlePhaseTransitionWithPrompt}
        handleExecuteAction={handleExecuteAction}
      />

      {confirmPhaseOpen && (
        <PhaseConfirmModal
          message={phasePromptMessage}
          onConfirm={confirmPhaseTransition}
          onCancel={cancelPhaseTransition}
        />
      )}

      {gameFinished && (
        <GameOverModel
          gameOver={gameFinished}
          currentUserId={currentUserId}
          onReset={resetGameSynced}
        />
      )}
    </div>
  );
}
