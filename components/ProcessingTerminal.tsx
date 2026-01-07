import React, { useEffect, useRef } from 'react';

interface ProcessingTerminalProps {
  logs: string[];
}

const ProcessingTerminal: React.FC<ProcessingTerminalProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col gap-1 overflow-y-auto no-scrollbar">
      {logs.length === 0 && (
        <div className="text-neutral-700 italic opacity-40">System log awaiting activity...</div>
      )}
      {logs.map((log, index) => (
        <div key={index} className="flex gap-3 text-neutral-500">
          <span className="text-cyan-500/50 select-none">[{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
          <span className={index === logs.length - 1 ? "text-white opacity-80" : "opacity-40"}>{log}</span>
        </div>
      ))}
    </div>
  );
};

export default ProcessingTerminal;