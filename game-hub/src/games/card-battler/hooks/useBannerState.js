import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_BANNER = { visible: false, title: '', subtitle: '' };

/**
 * Manages a single auto-dismissing banner with a slide-out animation.
 * Timers are stored in a ref so they survive re-renders without going stale.
 */
function useTimeoutBanner() {
  const [banner, setBanner]       = useState(DEFAULT_BANNER);
  const [slidingOut, setSlidingOut] = useState(false);
  const timers = useRef({ hide: null, slide: null });

  const show = useCallback((title, subtitle, slideDelay = 1400, hideDelay = 1800) => {
    clearTimeout(timers.current.slide);
    clearTimeout(timers.current.hide);

    setBanner({ visible: true, title, subtitle });
    setSlidingOut(false);

    timers.current.slide = setTimeout(() => setSlidingOut(true), slideDelay);
    timers.current.hide  = setTimeout(
      () => setBanner((prev) => ({ ...prev, visible: false })),
      hideDelay
    );
  }, []);

  // Cleanup on unmount only — do not set state after unmount.
  useEffect(() => {
    return () => {
      clearTimeout(timers.current.slide);
      clearTimeout(timers.current.hide);
    };
  }, []);

  return { banner, slidingOut, show };
}

/**
 * Centralises all battle-banner and shake state for the UI layer.
 *
 * @param {object|null} gameState  Normalised game state (with .player / .enemy keys)
 * @param {string|number} currentUserId
 */
export function useBannerState(gameState, currentUserId) {
  const [playerShake, setPlayerShake]       = useState(false);
  const [enemyShake, setEnemyShake]         = useState(false);
  const [confirmPhaseOpen, setConfirmPhaseOpen] = useState(false);

  const phaseBanner       = useTimeoutBanner();
  const attackBanner      = useTimeoutBanner();
  const defenseBanner     = useTimeoutBanner();
  const enemyAttackBanner  = useTimeoutBanner();
  const enemyDefenseBanner = useTimeoutBanner();
  const startingBanner    = useTimeoutBanner();

  // Use refs to track previous values without triggering re-renders.
  const prevPlayerHp    = useRef(gameState?.player?.hp   ?? 50);
  const prevEnemyBlock  = useRef(gameState?.enemy?.block ?? 0);
  const prevGameId      = useRef(null);
  const startShown      = useRef(false);

  const isPlayerTurn = String(gameState?.turnOwner) === String(currentUserId);

  // ── Match-start banner (fires once per unique game ID) ────────────────────
  useEffect(() => {
    if (!gameState?.id) return;
    if (startShown.current || prevGameId.current === gameState.id) return;

    prevGameId.current = gameState.id;
    startShown.current = true;
    startingBanner.show('Match Initialized', 'Prepare your battle deck strategies.', 2000, 2600);
  }, [gameState?.id, startingBanner.show]);

  // ── Phase / turn banner ───────────────────────────────────────────────────
  // BUG FIX: Track the previous phase+owner pair so the banner only fires when
  // something actually changes — not on every re-render that touches gameState.
  const prevPhaseKey = useRef(null);
  useEffect(() => {
    if (!gameState) return;

    const phaseKey = `${gameState.combatPhase}-${gameState.turnOwner}`;
    if (phaseKey === prevPhaseKey.current) return;
    prevPhaseKey.current = phaseKey;

    const phaseLabel = gameState.combatPhase === 'attack-phase' ? 'Attack Phase' : 'Defense Phase';

    if (isPlayerTurn) {
      phaseBanner.show('Your Turn', `Systems active for ${phaseLabel}.`, 1500, 2100);
    } else {
      phaseBanner.show('Opponent Turn', `Awaiting execution for ${phaseLabel}.`, 1500, 2100);
    }
  }, [gameState?.combatPhase, gameState?.turnOwner, isPlayerTurn, phaseBanner.show]);

  // ── HP damage and block-gain banners ─────────────────────────────────────
  useEffect(() => {
    if (!gameState) return;

    const currentHp    = gameState.player.hp;
    const currentBlock = gameState.enemy.block;

    if (currentHp < prevPlayerHp.current) {
      const damage = prevPlayerHp.current - currentHp;

      // BUG FIX: Use functional setState updater to avoid stale closure on the
      // shake timeout — the old code captured `setPlayerShake` inside a plain
      // setTimeout without clearing it on unmount, risking a no-op state update.
      setPlayerShake(true);
      const shakeTimer = setTimeout(() => setPlayerShake(false), 500);

      if (isPlayerTurn) {
        defenseBanner.show('Defense Resolution', `Shield compromised! Lost ${damage} HP.`, 1800, 2600);
      } else {
        enemyAttackBanner.show('Opponent Strike!', `Enemy hit for ${damage} damage.`, 1800, 2600);
      }

      // Return cleanup so the timeout doesn't fire after unmount.
      return () => clearTimeout(shakeTimer);
    }

    if (currentBlock > prevEnemyBlock.current && !isPlayerTurn) {
      const gain = currentBlock - prevEnemyBlock.current;
      enemyDefenseBanner.show('Opponent Shields Up!', `${gain} block gained.`, 1800, 2600);
    }

    prevPlayerHp.current   = currentHp;
    prevEnemyBlock.current = currentBlock;
  }, [
    gameState?.player?.hp,
    gameState?.enemy?.block,
    isPlayerTurn,
    defenseBanner.show,
    enemyAttackBanner.show,
    enemyDefenseBanner.show,
  ]);

  // Reset game-scoped refs when the component unmounts.
  useEffect(() => {
    return () => {
      prevGameId.current = null;
      startShown.current = false;
    };
  }, []);

  return {
    playerShake,
    setPlayerShake,
    enemyShake,
    setEnemyShake,
    confirmPhaseOpen,
    setConfirmPhaseOpen,
    phaseBanner:              phaseBanner.banner,
    phaseSlidingOut:          phaseBanner.slidingOut,
    attackBanner:             attackBanner.banner,
    attackBannerSlidingOut:   attackBanner.slidingOut,
    defenseBanner:            defenseBanner.banner,
    defenseBannerSlidingOut:  defenseBanner.slidingOut,
    enemyAttackBanner:        enemyAttackBanner.banner,
    enemyAttackBannerSlidingOut: enemyAttackBanner.slidingOut,
    enemyDefenseBanner:       enemyDefenseBanner.banner,
    enemyDefenseBannerSlidingOut: enemyDefenseBanner.slidingOut,
    startingBanner:           startingBanner.banner,
    startingBannerSlidingOut: startingBanner.slidingOut,
    showAttackBanner:         attackBanner.show,
    showDefenseBanner:        defenseBanner.show,
  };
}
