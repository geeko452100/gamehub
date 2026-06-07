import React from 'react';
import GameCard from './GameCard';

export default function FieldGrid({ stagedCards, onUnstage }) {
  return (
    <div className="grid grid-cols-5 gap-2 p-4 bg-slate-900 border border-slate-700 rounded-xl">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-40 border border-dashed border-slate-700 rounded flex items-center justify-center">
          {stagedCards[i] ? <GameCard card={stagedCards[i]} onClick={() => onUnstage(stagedCards[i].id)} /> : <span className="text-slate-600 text-xs">Slot {i+1}</span>}
        </div>
      ))}
    </div>
  );
}