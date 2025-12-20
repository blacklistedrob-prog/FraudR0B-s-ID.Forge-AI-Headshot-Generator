import React, { useEffect, useState } from 'react';

interface ProcessingTerminalProps {
  logs: string[];
}

const ProcessingTerminal: React.FC<ProcessingTerminalProps> = ({ logs }) => {
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);

  useEffect(() => {
    setDisplayedLogs(logs);
    // Auto scroll logic would go here if we were using a ref
  }, [logs]);

  return (
    <div className="w-full h-48 bg-black rounded-lg border border-zinc-800 p-4 font-mono text-xs overflow-y-auto shadow-inner">
      <div className="flex flex-col gap-1">
        {displayedLogs.map((log, index) => (
          <div key={index} className="flex gap-2 text-green-500/80">
            <span className="text-zinc-600 select-none">{`>`}</span>
            <span className={index === displayedLogs.length - 1 ? "animate-pulse" : ""}>{log}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingTerminal;