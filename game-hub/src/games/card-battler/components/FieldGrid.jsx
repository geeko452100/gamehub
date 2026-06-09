import { useState } from 'react';
import GameCard from './GameCard';

export default function FieldGrid({ stagedCards, isPlayerTurn, handleDragStart, handleDragOver, handleSlotDrop, onUnstage }) {
  const [activeSlotIndex, setActiveSlotIndex] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-widest text-slate-400 font-bold">Playing Field</h3>
        <span className="text-xs text-slate-500">Stage cards here for execution</span>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`aspect-[3/4] min-h-[20rem] bg-slate-900 border rounded-lg flex items-center justify-center relative overflow-hidden transition-all duration-200 ${activeSlotIndex === i ? 'border-indigo-400/90 ring-2 ring-indigo-400/30 bg-slate-800 shadow-[0_0_0_4px_rgba(129,140,248,0.15)]' : 'border-slate-800'}`}
            onDragEnter={() => setActiveSlotIndex(i)}
            onDragLeave={() => setActiveSlotIndex((current) => (current === i ? null : current))}
            onDragOver={handleDragOver}
            onDrop={(e) => {
              handleSlotDrop(e, i); // Pass index so handler knows which slot received the drop
              setActiveSlotIndex(null);
            }}
          >
            {stagedCards[i] ? (
              <GameCard
                card={stagedCards[i]}
                className="animate-in slide-in-from-bottom-4 fade-in duration-500 w-full h-full"
                canAfford={false}
                clickable
                draggable={isPlayerTurn}
                onDragStart={handleDragStart(stagedCards[i].instanceId, 'stage')}
                onDragOver={handleDragOver}
                onDrop={(e) => {
                  handleSlotDrop(e, i);
                  setActiveSlotIndex(null);
                }}
                onClick={() => onUnstage(stagedCards[i].instanceId)}
              />
            ) : (
              <span className="text-slate-700 text-xs font-mono">FIELD SLOT {i + 1}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}