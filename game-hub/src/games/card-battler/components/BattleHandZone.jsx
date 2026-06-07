import GameCard from './GameCard';

export default function BattleHandZone({ 
  hand, 
  isPlayerTurn, 
  playerEnergy, 
  combatPhase, // Passed down from CardBattlerEngine state context
  handlePlayCard, 
  handleDragStart, 
  handleDragOver, 
  handleHandDrop 
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold">Tactical Command Hand</h3>
        <span className="text-xs text-slate-500">Click a card to stage it onto the field</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" onDragOver={handleDragOver} onDrop={handleHandDrop}>
        {hand.length > 0 ? (
          hand.map((card) => {
            // 1. Verify card type matches the active combat segment phase rule
            const phaseMatches = 
              (combatPhase === 'attack-phase' && card.type === 'attack') ||
              (combatPhase === 'defense-phase' && (card.type === 'defend' || card.type === 'defense'));

            // 2. Combine all rules together to determine true playability
            const canAfford = playerEnergy >= card.cost;
            const isPlayable = isPlayerTurn && phaseMatches && canAfford;

            return (
              <GameCard
                key={card.id}
                card={card}
                onClick={handlePlayCard}
                canAfford={canAfford}
                isPlayable={isPlayable} // Direct boolean to toggle card styles
                draggable={isPlayable}
                onDragStart={handleDragStart(card.id, 'hand')}
              />
            );
          })
        ) : (
          <div className="col-span-full rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-slate-500 text-sm text-center">
            Your hand is empty. End your turn to draw new cards.
          </div>
        )}
      </div>
    </div>
  );
}