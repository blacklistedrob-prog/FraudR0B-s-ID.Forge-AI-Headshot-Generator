import React, { useState, useEffect } from 'react';

const ForensicLoadingHUD = () => {
  const [progress, setProgress] = useState(0);
  const [activeModule, setActiveModule] = useState('Neural Baseline');
  const [hexLine, setHexLine] = useState('');

  const modules = [
    'Biometric Mapping',
    'Neural Fabrication',
    'Skin Texture Synthesis',
    'EXIF Header Forgery',
    'Spectral Laundering',
    'Biometric Verification'
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return prev;
        return prev + (Math.random() * 2);
      });
    }, 150);

    const moduleInterval = setInterval(() => {
      setActiveModule(modules[Math.floor(Math.random() * modules.length)]);
    }, 1200);

    const hexInterval = setInterval(() => {
      const chars = '0123456789ABCDEF';
      let line = '';
      for(let i=0; i<32; i++) line += chars[Math.floor(Math.random() * 16)];
      setHexLine(line);
    }, 100);

    return () => {
      clearInterval(progressInterval);
      clearInterval(moduleInterval);
      clearInterval(hexInterval);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-xl animate-in fade-in duration-500 overflow-hidden">
      {/* Scanning Laser Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500/50 shadow-[0_0_15px_#06b6d4] animate-[scan_2.5s_ease-in-out_infinite]"></div>
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0vh); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.2; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
      `}</style>

      {/* Central Visualizer */}
      <div className="relative mb-12">
        {/* Pulsing Rings */}
        <div className="absolute -inset-16 border border-cyan-500/10 rounded-full animate-[pulse-ring_3s_ease-in-out_infinite]"></div>
        <div className="absolute -inset-24 border border-cyan-500/5 rounded-full animate-[pulse-ring_4s_ease-in-out_infinite_reverse]"></div>
        
        {/* The Brain/Head Wireframe Icon */}
        <div className="relative p-10 rounded-full bg-cyan-500/5 border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)] backdrop-blur-md">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="text-cyan-500 animate-pulse">
            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
            <path d="M12 4C10.5 4 8 6 8 10C8 14 10.5 16 12 16" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 4C13.5 4 16 6 16 10C16 14 13.5 16 12 16" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="10" r="1.5" fill="currentColor" />
            <path d="M8 10H16" stroke="currentColor" strokeWidth="0.5" />
            <path d="M12 16V22" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Technical Readout */}
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-sm font-black text-white tracking-[0.5em] uppercase animate-pulse">Neural Fabrication Active</h2>
          <div className="flex items-center justify-center gap-3">
             <span className="h-1 w-1 bg-cyan-500 rounded-full animate-ping"></span>
             <p className="text-[10px] font-mono text-cyan-500/70 tracking-widest uppercase">{activeModule}...</p>
          </div>
        </div>

        {/* Custom Progress Bar */}
        <div className="space-y-2">
          <div className="h-1.5 w-full bg-neutral-900 rounded-full border border-white/5 overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between font-mono text-[8px] uppercase tracking-tighter text-neutral-600">
            <span>Proc_Stream: {hexLine.slice(0, 12)}</span>
            <span className="text-cyan-500 font-bold">{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Random Hex Stream */}
        <div className="bg-black/60 p-3 rounded-xl border border-white/5 font-mono text-[8px] text-neutral-700 break-all overflow-hidden h-10 flex items-center justify-center">
          {hexLine}
        </div>
      </div>

      {/* Floating Labels */}
      <div className="absolute top-1/4 left-10 hidden xl:block space-y-4">
        <div className="p-2 border-l border-cyan-500/20 text-[8px] font-mono text-neutral-500 uppercase">
          <div className="text-cyan-500">Latency</div> 24ms
        </div>
        <div className="p-2 border-l border-cyan-500/20 text-[8px] font-mono text-neutral-500 uppercase">
          <div className="text-cyan-500">Node</div> ID.FORGE.E14
        </div>
      </div>
      
      <div className="absolute bottom-1/4 right-10 hidden xl:block space-y-4 text-right">
        <div className="p-2 border-r border-cyan-500/20 text-[8px] font-mono text-neutral-500 uppercase">
          <div className="text-cyan-500">Entropy</div> High
        </div>
        <div className="p-2 border-r border-cyan-500/20 text-[8px] font-mono text-neutral-500 uppercase">
          <div className="text-cyan-500">Launder</div> Pass
        </div>
      </div>
    </div>
  );
};

export default ForensicLoadingHUD;