// src/components/BattleDashboards.jsx
import React from 'react';
import { MAX_HAND_SIZE } from '../gameLogic';

export default function BattleDashboards({ player, enemy, turnOwner, turnPhase }) {
  return (
    <div className="grid grid-cols-2 gap-4 bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-2xl">
      <div className="space-y-2">
        <h2 className="text-xs uppercase font-mono tracking-widest text-slate-500">Player Core status</h2>
        <div className="text-2xl font-black text-emerald-400">
          {player.hp} <span className="text-xs text-slate-500 font-normal">/ 30 HP</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          <span className="bg-indigo-950 border border-indigo-500/30 text-indigo-400 px-2 py-0.5 rounded">
            Energy: {player.energy}/3
          </span>
          {player.block > 0 && (
            <span className="bg-emerald-950 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded">
              Block: +{player.block}
            </span>
          )}
          <span className="bg-slate-900 border border-slate-700 text-slate-400 px-2 py-0.5 rounded">
            Hand: {player.hand.length}/{MAX_HAND_SIZE}
          </span>
          <span className="bg-slate-900 border border-slate-700 text-slate-400 px-2 py-0.5 rounded">
            Attack Deck: {player.attackDeck.length}
          </span>
          <span className="bg-slate-900 border border-slate-700 text-slate-400 px-2 py-0.5 rounded">
            Defense Deck: {player.defenseDeck.length}
          </span>
          <span className="bg-slate-900 border border-slate-700 text-slate-400 px-2 py-0.5 rounded">
            Attack Discard: {player.attackDiscard.length}
          </span>
          <span className="bg-slate-900 border border-slate-700 text-slate-400 px-2 py-0.5 rounded">
            Defense Discard: {player.defenseDiscard.length}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-right">
        <h2 className="text-xs uppercase font-mono tracking-widest text-slate-500">Opponent Engine node</h2>
        <div className="text-2xl font-black text-rose-500">
          {enemy.hp} <span className="text-xs text-slate-500 font-normal">/ 30 HP</span>
        </div>
        <div className="flex gap-2 text-xs font-mono justify-end">
          {enemy.block > 0 && (
            <span className="bg-amber-950 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded">
              Block: +{enemy.block}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded border transition-colors ${
            turnOwner === 'enemy-turn' 
              ? 'bg-rose-950/40 text-rose-400 border-rose-500 animate-pulse' 
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}>
            {turnOwner === 'enemy-turn'
              ? 'Opponent Turn'
              : turnPhase === 'draw-phase'
                ? 'Draw Phase'
                : 'Main Phase'}
          </span>
        </div>
      </div>
    </div>
  );
}