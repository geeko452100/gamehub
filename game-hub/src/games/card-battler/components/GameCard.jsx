// src/components/GameCard.jsx
import React from 'react';
import { Shield, ShieldAlert, Swords } from 'lucide-react';

export default function GameCard({ card, onClick, canAfford, draggable, onDragStart, clickable, className }) {
  const isClickable = Boolean(onClick && (canAfford || clickable));
  const interactiveStyles = isClickable
    ? 'border-indigo-500/30 hover:-translate-y-4 hover:shadow-indigo-500/10 hover:border-indigo-400'
    : 'border-slate-800 opacity-50 cursor-not-allowed';
  const cursorStyles = draggable
    ? 'cursor-grab active:cursor-grabbing'
    : isClickable
      ? 'cursor-pointer'
      : 'cursor-not-allowed';

  return (
    <div 
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={() => isClickable && onClick(card.id)}
      className={`${className ?? 'w-40 h-56'} bg-slate-950 border rounded-xl p-3 flex flex-col justify-between shadow-2xl transition-all duration-200 select-none ${interactiveStyles} ${cursorStyles}`}
    >
      <div className="flex justify-between items-center">
        <span className="text-xs font-black tracking-wide text-slate-200 truncate max-w-[70%]">{card.name}</span>
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border
          ${canAfford ? 'bg-indigo-950 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
          {card.cost}
        </span>
      </div>

      <div className="flex-1 my-2 rounded-lg bg-slate-900 border border-slate-800/50 flex items-center justify-center text-slate-600">
        {card.type === 'attack' ? <Swords className="w-8 h-8 text-rose-500/40" /> : <Shield className="w-8 h-8 text-emerald-400/40" />}
      </div>

      <p className="text-[10px] text-slate-400 text-center leading-tight mb-2 min-h-[24px]">
        {card.description}
      </p>

      <div className="flex justify-around items-center border-t border-slate-800/50 pt-2 text-xs font-bold">
        <span className="flex items-center gap-1 text-rose-400">
          <Swords className="w-3.5 h-3.5" /> {card.attack}
        </span>
        <span className="flex items-center gap-1 text-emerald-400">
          <ShieldAlert className="w-3.5 h-3.5" /> {card.defense}
        </span>
      </div>
    </div>
  );
}