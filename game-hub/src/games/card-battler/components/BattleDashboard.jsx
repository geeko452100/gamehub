import { Shield } from 'lucide-react';

export default function BattleDashboard({ player, enemy, playerShake, enemyShake }) {
  return (
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
  );
}
