// src/components/GameOverModal.jsx
import React from 'react';

export default function GameOverModal({ result, onReset }) {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
      <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <h2 className={`text-3xl font-black mb-3 ${result === 'victory' ? 'text-emerald-300' : 'text-rose-500'}`}>
          {result === 'victory' ? 'Victory' : result === 'deckout' ? 'Deck-Out Defeat' : 'Defeat'}
        </h2>
        <p className="text-sm text-slate-300 mb-6">
          {result === 'victory'
            ? 'You defeated the enemy and won the duel.'
            : result === 'deckout'
              ? 'You have no cards left to draw and lose by deck-out.'
              : 'Your core was destroyed. Reset and try again.'}
        </p>
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition"
        >
          Restart Duel
        </button>
      </div>
    </div>
  );
}