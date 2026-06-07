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
      setBanner(defaultBanner); // Fix: Reset visibility state on Strict Mode unmount
      setSlidingOut(false);     // Fix: Reset transition state on Strict Mode unmount
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
  const startingBanner = useTimeoutBanner();

  const previousPlayerHp = useRef(gameState.player.hp);
  const previousEnemyBlock = useRef(gameState.enemy.block);
  const previousTurnOwner = useRef(gameState.turnOwner);
  
  // Fix: Initialize to null so it forces a match check on fresh mount survives double-mounts
  const previousStartId = useRef(null); 
  const startBannerActive = useRef(false);
  const phaseBannerTimer = useRef(null);
  const startBannerTimer = useRef(null);

  useEffect(() => {
    const ownerLabel = gameState.turnOwner === 'player-turn' ? 'Player' : 'Enemy';
    const flipMessage = gameState.startFlip ? `${ownerLabel} won the coin toss.` : 'Winning coin toss.';
    const phaseLabel = gameState.combatPhase === 'attack-phase' ? 'Attack Phase' : 'Defense Phase';
    const phaseTitle = `${ownerLabel} ${phaseLabel}`;
    
    let phaseSubtitle = gameState.turnOwner === 'player-turn'
      ? `Your ${phaseLabel} is now active.`
      : `Enemy ${phaseLabel} is now active.`;

    // Fix: Provide context if it is the restrictive opening round
    if (gameState.isFirstTurnOfGame) {
      phaseSubtitle = gameState.turnOwner === 'player-turn'
        ? "First turn rule: You must defend or setup first!"
        : "First turn rule: Enemy must defend or setup first!";
    }

    const showStartingBanner = () => {
      clearTimeout(startBannerTimer.current);
      startingBanner.show(`${ownerLabel} goes first!`, flipMessage, 1000, 2000);
      startBannerActive.current = true;
      startBannerTimer.current = setTimeout(() => {
        startBannerActive.current = false;
        startBannerTimer.current = null;
      }, 2000);
    };

    const showPhaseBanner = () => {
      clearTimeout(phaseBannerTimer.current);
      if (startBannerActive.current) {
        phaseBannerTimer.current = setTimeout(() => {
          phaseBanner.show(phaseTitle, phaseSubtitle, 1000, 2000);
        }, 2000);
      } else {
        phaseBanner.show(phaseTitle, phaseSubtitle, 1000, 2000);
      }
    };

    // Fix: Cleaned condition checks (dropped hasMountedRef check completely)
    if (previousStartId.current !== gameState.startId) {
      previousStartId.current = gameState.startId;
      showStartingBanner();
      showPhaseBanner();
      return;
    }

    showPhaseBanner();
  }, [gameState.combatPhase, gameState.startId, gameState.turnOwner, gameState.isFirstTurnOfGame]);

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

  useEffect(() => {
    return () => {
      clearTimeout(phaseBannerTimer.current);
      clearTimeout(startBannerTimer.current);
      previousStartId.current = null; // Fix: Reset tracking variables across cleanup loops
      startBannerActive.current = false;
    };
  }, []);

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
    startingBanner: startingBanner.banner,
    startingBannerSlidingOut: startingBanner.slidingOut,
    showAttackBanner: attackBanner.show,
    showDefenseBanner: defenseBanner.show,
    showEnemyAttackBanner: enemyAttackBanner.show,
    showEnemyDefenseBanner: enemyDefenseBanner.show
  };
}