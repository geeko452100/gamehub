// @ts-nocheck
import { Shield } from 'lucide-react';
import GameCard from './components/GameCard';
import GameOverModel from './components/GameOverModel';
import { useCardBattler } from './hooks/useCardBattler';
import { useBattleUI } from './hooks/useBattleUI';

export default function CardBattlerEngine() {
  const { gameState, stageCard, unstageCard, handlePhaseTransition, startPlayerTurn, executeAttack, executeDefense, resetGame } = useCardBattler();
  const {
    playerShake,
    enemyShake,
    confirmPhaseOpen,
    phaseBanner,
    phaseSlidingOut,
    attackBanner,
    attackBannerSlidingOut,
    defenseBanner,
    defenseBannerSlidingOut,
    enemyAttackBanner,
    enemyAttackBannerSlidingOut,
    enemyDefenseBanner,
    enemyDefenseBannerSlidingOut,
    gameFinished,
    phaseButtonLabel,
    phasePromptMessage,
    actionReady,
    actionLabel,
    handlePlayCard,
    handleExecuteAction,
    handleDragStart,
    handleDragOver,
    handleSlotDrop,
    handleHandDrop,
    handlePhaseTransitionWithPrompt,
    confirmPhaseTransition,
    cancelPhaseTransition
  } = useBattleUI({
    gameState,
    stageCard,
    unstageCard,
    handlePhaseTransition,
    executeAttack,
    executeDefense,
    resetGame
  });

  const { player, enemy, combatPhase, turnOwner } = gameState;
  const hand = player.hand;
  const staged = player.staged;
  const isPlayerTurn = turnOwner === 'player-turn';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-white bg-slate-900 min-h-screen">
      <div className={`fixed left-1/2 top-6 z-40 w-[min(92vw,28rem)] -translate-x-1/2 rounded-3xl border border-slate-700 bg-slate-950/95 p-4 text-center shadow-2xl transition-all duration-500 ease-out ${phaseBanner.visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'} ${phaseSlidingOut ? '-translate-y-16 opacity-0' : ''}`}>
        <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Phase Alert</p>
        <h2 className="mt-2 text-lg font-black text-white">{phaseBanner.title}</h2>
        <p className="mt-1 text-sm text-slate-300">{phaseBanner.subtitle}</p>
      </div>

      <div className={`fixed left-1/2 top-24 z-40 w-[min(92vw,28rem)] -translate-x-1/2 rounded-3xl border border-rose-500 bg-rose-600/95 p-4 text-center shadow-[0_20px_120px_-40px_rgba(244,63,94,0.65)] transition-all duration-500 ease-out ${attackBanner.visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'} ${attackBannerSlidingOut ? '-translate-y-16 opacity-0' : ''}`}>
        <p className="text-[10px] uppercase tracking-[0.4em] text-amber-100">Attack!</p>
        <h2 className="mt-2 text-lg font-black text-white">{attackBanner.title}</h2>
        <p className="mt-1 text-sm text-amber-100">{attackBanner.subtitle}</p>
      </div>

      <div className={`fixed left-1/2 top-40 z-40 w-[min(92vw,28rem)] -translate-x-1/2 rounded-3xl border border-slate-700 bg-slate-950/95 p-4 text-center shadow-[0_20px_120px_-40px_rgba(15,23,42,0.85)] transition-all duration-500 ease-out ${defenseBanner.visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'} ${defenseBannerSlidingOut ? '-translate-y-16 opacity-0' : ''}`}>
        <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400">Defense!</p>
        <h2 className="mt-2 text-lg font-black text-white">{defenseBanner.title}</h2>
        <p className="mt-1 text-sm text-slate-300">{defenseBanner.subtitle}</p>
      </div>

      <div className={`fixed left-1/2 top-56 z-40 w-[min(92vw,28rem)] -translate-x-1/2 rounded-3xl border border-rose-500 bg-slate-950/95 p-4 text-center shadow-[0_20px_120px_-40px_rgba(15,23,42,0.85)] transition-all duration-500 ease-out ${enemyAttackBanner.visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'} ${enemyAttackBannerSlidingOut ? '-translate-y-16 opacity-0' : ''}`}>
        <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400">Enemy Strike</p>
        <h2 className="mt-2 text-lg font-black text-white">{enemyAttackBanner.title}</h2>
        <p className="mt-1 text-sm text-slate-300">{enemyAttackBanner.subtitle}</p>
      </div>

      <div className={`fixed left-1/2 top-72 z-40 w-[min(92vw,28rem)] -translate-x-1/2 rounded-3xl border border-emerald-500 bg-emerald-600/95 p-4 text-center shadow-[0_20px_120px_-40px_rgba(16,185,129,0.35)] transition-all duration-500 ease-out ${enemyDefenseBanner.visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'} ${enemyDefenseBannerSlidingOut ? '-translate-y-16 opacity-0' : ''}`}>
        <p className="text-[10px] uppercase tracking-[0.4em] text-slate-100 flex items-center justify-center gap-2">
          <Shield className="h-3.5 w-3.5 text-slate-100" /> Enemy Defense
        </p>
        <h2 className="mt-2 text-lg font-black text-white">{enemyDefenseBanner.title}</h2>
        <p className="mt-1 text-sm text-slate-100">{enemyDefenseBanner.subtitle}</p>
      </div>
      {/* 1. Dashboard with Shake Animation */}
      <div className="grid grid-cols-2 gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl">
        <div className={`space-y-1 transition-all ${playerShake ? 'animate-shake' : ''}`}>
          <h2 className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Player Core</h2>
          <div className="text-3xl font-black text-white">{player.hp} HP</div>
          {player.block > 0 && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-700">
                <Shield className="h-4 w-4" />
                {player.block} Block
              </span>
            </div>
          )}
        </div>

        <div className={`text-right transition-all ${enemyShake ? 'animate-shake' : ''}`}>
          <h2 className="text-[10px] uppercase tracking-widest text-rose-500 font-bold">Opponent Node</h2>
          <div className="text-3xl font-black text-white">{enemy.hp} HP</div>
          {enemy.block > 0 && (
            <div className="mt-2 flex justify-end">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold text-rose-300 border border-rose-700">
                <Shield className="h-4 w-4" />
                {enemy.block} Block
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Playing Field Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold">Playing Field</h3>
          <span className="text-xs text-slate-500">Stage cards here for execution</span>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={handleSlotDrop}
            >
              {staged[i] ? (
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 w-full h-full">
                  <GameCard
                    card={staged[i]}
                    className="w-full h-full"
                    canAfford={false}
                    clickable
                    draggable={isPlayerTurn}
                    onDragStart={handleDragStart(staged[i].id, 'stage')}
                    onClick={() => unstageCard(staged[i].id)}
                  />
                </div>
              ) : (
                <span className="text-slate-700 text-xs font-mono">FIELD SLOT {i + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Player Hand Zone */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold">Tactical Command Hand</h3>
          <span className="text-xs text-slate-500">Click a card to stage it onto the field</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          onDragOver={handleDragOver}
          onDrop={handleHandDrop}
        >
          {hand.length > 0 ? (
            hand.map((card) => (
              <GameCard
                key={card.id}
                card={card}
                onClick={handlePlayCard}
                canAfford={isPlayerTurn && player.energy >= card.cost}
                draggable={isPlayerTurn && player.energy >= card.cost}
                onDragStart={handleDragStart(card.id, 'hand')}
              />
            ))
          ) : (
            <div className="col-span-full rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-slate-500 text-sm text-center">
              Your hand is empty. End your turn to draw new cards.
            </div>
          )}
        </div>
      </div>

      {/* 4. Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button 
          onClick={handlePhaseTransitionWithPrompt}
          disabled={gameFinished}
          className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest transition-all ${
            combatPhase === 'attack-phase' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
          } ${gameFinished ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {phaseButtonLabel}
        </button>

        <button
          onClick={handleExecuteAction}
          disabled={gameFinished || !actionReady}
          className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest transition-all ${
            !gameFinished && actionReady
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
          }`}
        >
          {actionLabel}
        </button>
      </div>

      {confirmPhaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
            <h2 className="text-xl font-black text-slate-100 mb-3">Confirm Phase Change</h2>
            <p className="text-sm text-slate-300 mb-8">{phasePromptMessage}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={confirmPhaseTransition}
                className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition"
              >
                Yes, continue
              </button>
              <button
                onClick={cancelPhaseTransition}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <GameOverModel result={gameState.gameOver} onReset={resetGame} />
    </div>
  );
}