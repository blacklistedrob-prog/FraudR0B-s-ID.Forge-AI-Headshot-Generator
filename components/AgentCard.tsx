import React from 'react';
import { AgentStats } from '../types';

interface AgentCardProps {
  stats: AgentStats;
  isActive: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ stats, isActive }) => {
  return (
    <div className={`relative overflow-hidden rounded-xl border transition-all duration-500 ${isActive ? 'border-cyan-500 bg-cyan-950/20 shadow-[0_0_30px_rgba(6,182,212,0.3)]' : 'border-zinc-800 bg-zinc-900/50'}`}>
      
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20" 
           style={{ backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      <div className="relative p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
             <h3 className="text-xl font-bold font-mono text-cyan-400 tracking-tighter uppercase">{stats.name}</h3>
             <span className="text-xs font-mono text-cyan-200/60 border border-cyan-800/50 px-2 py-0.5 rounded bg-black/40">{stats.classType}</span>
          </div>
          <div className={`h-3 w-3 rounded-full ${isActive ? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]' : 'bg-zinc-700'}`}></div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm font-mono mt-4">
            <div className="bg-black/40 p-2 rounded border border-cyan-900/30">
                <span className="text-zinc-500 block text-xs">HP (Heuristic Power)</span>
                <span className="text-cyan-300 font-bold text-lg">{stats.hp}</span>
            </div>
            <div className="bg-black/40 p-2 rounded border border-cyan-900/30">
                <span className="text-zinc-500 block text-xs">MP (Memory Proc)</span>
                <span className="text-purple-300 font-bold text-lg">{stats.mp}</span>
            </div>
        </div>

        <div className="pt-2 border-t border-cyan-900/30">
             <p className="text-xs text-zinc-400 italic mb-2">"{stats.description}"</p>
             <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-500 uppercase">Special Ability:</span>
                <span className="text-xs text-zinc-300">{stats.ability}</span>
             </div>
        </div>
      </div>

      {isActive && (
          <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 animate-[width_2s_ease-in-out_infinite] w-full" style={{ width: '100%' }}></div>
      )}
    </div>
  );
};

export default AgentCard;