import { useCallback, useEffect, useRef, useState } from 'react';

const defaultBanner = { visible: false, title: '', subtitle: '' };

function useTimeoutBanner() {
  const [banner, setBanner] = useState(defaultBanner);
  const [slidingOut, setSlidingOut] = useState(false);
  const timers = useRef({ hide: null, slide: null });

  const show = useCallback((title, subtitle, slideDelay = 1400, hideDelay = 1800) => {
    clearTimeout(timers.current.slide);
    clearTimeout(timers.current.hide);
    setBanner({ visible: true, title, subtitle });
    setSlidingOut(false);

    timers.current.slide = setTimeout(() => setSlidingOut(true), slideDelay);
    timers.current.hide = setTimeout(() => setBanner((prev) => ({ ...prev, visible: false })), hideDelay);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(timers.current.slide);
      clearTimeout(timers.current.hide);
    };
  }, []);

  return { banner, slidingOut, show };
}

export function useBannerState(gameState) {
  const [playerShake, setPlayerShake] = useState(false);
  const [enemyShake, setEnemyShake] = useState(false);
  const [confirmPhaseOpen, setConfirmPhaseOpen] = useState(false);

  const phaseBanner = useTimeoutBanner();
  const attackBanner = useTimeoutBanner();
  const defenseBanner = useTimeoutBanner();
  const enemyAttackBanner = useTimeoutBanner();
  const enemyDefenseBanner = useTimeoutBanner();

  const previousPlayerHp = useRef(gameState.player.hp);
  const previousEnemyBlock = useRef(gameState.enemy.block);
  const previousTurnOwner = useRef(gameState.turnOwner);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const ownerLabel = gameState.turnOwner === 'player-turn' ? 'Player' : 'Enemy';
    const phaseLabel = gameState.combatPhase === 'attack-phase' ? 'Attack Phase' : 'Defense Phase';
    const title = `${ownerLabel} ${phaseLabel}`;
    const subtitle = gameState.turnOwner === 'player-turn'
      ? `Your ${phaseLabel} is now active.`
      : `Enemy ${phaseLabel} is now active.`;

    phaseBanner.show(title, subtitle, 1000, 2000);
  }, [gameState.combatPhase, gameState.turnOwner]);

  useEffect(() => {
    if (previousTurnOwner.current !== gameState.turnOwner) {
      previousTurnOwner.current = gameState.turnOwner;
      previousPlayerHp.current = gameState.player.hp;
      previousEnemyBlock.current = gameState.enemy.block;
      return;
    }

    if (gameState.turnOwner === 'enemy-turn') {
      if (gameState.player.hp < previousPlayerHp.current) {
        const damage = previousPlayerHp.current - gameState.player.hp;
        enemyAttackBanner.show('Enemy Strike!', `${damage} damage hit your core.`);
      }

      if (gameState.enemy.block > previousEnemyBlock.current) {
        const blockGain = gameState.enemy.block - previousEnemyBlock.current;
        enemyDefenseBanner.show('Enemy Shields Up!', `${blockGain} block gained.`, 1800, 2600);
      }
    }

    previousPlayerHp.current = gameState.player.hp;
    previousEnemyBlock.current = gameState.enemy.block;
  }, [gameState.enemy.block, gameState.player.hp, gameState.turnOwner]);

  return {
    playerShake,
    setPlayerShake,
    enemyShake,
    setEnemyShake,
    confirmPhaseOpen,
    setConfirmPhaseOpen,
    phaseBanner: phaseBanner.banner,
    phaseSlidingOut: phaseBanner.slidingOut,
    attackBanner: attackBanner.banner,
    attackBannerSlidingOut: attackBanner.slidingOut,
    defenseBanner: defenseBanner.banner,
    defenseBannerSlidingOut: defenseBanner.slidingOut,
    enemyAttackBanner: enemyAttackBanner.banner,
    enemyAttackBannerSlidingOut: enemyAttackBanner.slidingOut,
    enemyDefenseBanner: enemyDefenseBanner.banner,
    enemyDefenseBannerSlidingOut: enemyDefenseBanner.slidingOut,
    showAttackBanner: attackBanner.show,
    showDefenseBanner: defenseBanner.show,
    showEnemyAttackBanner: enemyAttackBanner.show,
    showEnemyDefenseBanner: enemyDefenseBanner.show
  };
}
