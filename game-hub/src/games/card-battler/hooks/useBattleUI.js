import { useBattleActions } from './useBattleActions';
import { useBannerState } from './useBannerState';

export function useBattleUI(args) {
  const cancelPhaseTransition = () => {
    setConfirmPhaseOpen(false);

    if (document.body.style.cursor === 'not-allowed') {
      document.body.style.cursor = 'default';
    }
  };

  const bannerState = useBannerState(args.gameState);
  const actions = useBattleActions({
    ...args,
    setConfirmPhaseOpen: bannerState.setConfirmPhaseOpen,
    setEnemyShake: bannerState.setEnemyShake,
    showAttackBanner: bannerState.showAttackBanner,
    showDefenseBanner: bannerState.showDefenseBanner
  });

  return {
    ...bannerState,
    ...actions,
    resetGame: args.resetGame
  };
}
