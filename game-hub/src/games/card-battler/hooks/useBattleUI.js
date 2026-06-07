import { useBattleActions } from './useBattleActions';
import { useBannerState } from './useBannerState';

export function useBattleUI(args) {
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
