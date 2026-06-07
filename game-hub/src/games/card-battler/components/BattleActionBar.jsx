export default function BattleActionBar({ combatPhase, gameFinished, actionReady, phaseButtonLabel, actionLabel, handlePhaseTransitionWithPrompt, handleExecuteAction }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <button
        onClick={handlePhaseTransitionWithPrompt}
        disabled={gameFinished}
        className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest transition-all ${combatPhase === 'attack-phase' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-orange-500 hover:bg-orange-400'} ${gameFinished ? 'opacity-50 cursor-not-allowed' : 'text-slate-950'}`}
      >
        {phaseButtonLabel}
      </button>
      <button
        onClick={handleExecuteAction}
        disabled={gameFinished || !actionReady}
        className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest transition-all ${!gameFinished && actionReady ? (actionLabel.toLowerCase().includes('attack') ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white') : 'bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'}`}
      >
        {actionLabel}
      </button>
    </div>
  );
}
