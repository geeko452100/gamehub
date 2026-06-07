// src/components/HandDrawer.jsx
import React from 'react';
import GameCard from './GameCard';

export default function HandDrawer({ hand, energy, isPlayerTurn, onEndTurn }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold tracking-wide text-slate-400">Tactical Command Hand</h3>
        <button 
          onClick={onEndTurn}
          disabled={!isPlayerTurn}
          className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wide transition-all duration-200 border
            ${isPlayerTurn 
              ? 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700 cursor-pointer shadow-md'
              : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-40' } `}
        >
          End Processing Turn
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {hand.length > 0 ? (
          hand.map(card => (
            <GameCard
              key={card.id}
              card={card}
              canAfford={isPlayerTurn && energy >= card.cost}
              draggable={isPlayerTurn && energy >= card.cost}
              onDragStart={(e) => e.dataTransfer.setData('cardId', card.id)}
              onClick={() => {}} 
            />
          ))
        ) : (
          <div className="col-span-full rounded-3xl border border-slate-800 bg-slate-950/80 p-6 text-slate-500 text-sm text-center">
            Tactical command hand empty. End Processing Turn to reload your deck.
          </div>
        )}
      </div>
    </div>
  );
}