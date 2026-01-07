import React, { useEffect, useState } from 'react';
import { retrieveRecentOperations, clearMemory } from '../services/memoryService';

interface MemoryModalProps {
  onClose: () => void;
  onLoadImage: (base64: string) => void;
}

const MemoryModal: React.FC<MemoryModalProps> = ({ onClose, onLoadImage }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMemory = async () => {
      setLoading(true);
      const docs = await retrieveRecentOperations(50);
      setItems(docs);
      setLoading(false);
  };

  useEffect(() => {
    loadMemory();
  }, []);

  const handlePurge = async () => {
      if(confirm("WARNING: This will wipe all archived neural patterns. Continue?")) {
          await clearMemory();
          loadMemory();
      }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[80vh] bg-zinc-950 border border-green-900/50 shadow-[0_0_50px_rgba(34,197,94,0.1)] flex flex-col rounded-sm overflow-hidden">
        
        {/* Header */}
        <div className="h-12 bg-black border-b border-zinc-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 text-green-500 font-mono font-bold text-xs">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            LONG TERM MEMORY BANK [RXDB::DEXIE]
          </div>
          <div className="flex gap-4">
            <button onClick={handlePurge} className="text-red-500 hover:text-red-400 font-mono text-xs uppercase hover:underline">[PURGE]</button>
            <button onClick={onClose} className="text-zinc-500 hover:text-white font-mono text-xs">[CLOSE]</button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
                <div className="text-green-500 font-mono text-center mt-20">ACCESSING NEURAL ARCHIVE...</div>
            ) : items.length === 0 ? (
                <div className="text-zinc-600 font-mono text-center mt-20 flex flex-col items-center gap-2">
                    <span>MEMORY EMPTY</span>
                    <span className="text-[10px]">Execute operations to populate archive.</span>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map((item) => (
                        <div key={item.id} className="group relative border border-zinc-800 bg-zinc-900/50 hover:border-green-500/50 transition-all cursor-pointer" onClick={() => { onLoadImage(item.imageData); onClose(); }}>
                            <div className="aspect-square w-full overflow-hidden relative">
                                <img src={item.imageData} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                    <span className="text-green-400 text-[10px] font-mono font-bold">RECALL</span>
                                </div>
                            </div>
                            <div className="p-2 border-t border-zinc-800 font-mono text-[9px] text-zinc-500 flex flex-col gap-1">
                                <div className="flex justify-between">
                                    <span className="text-zinc-300">{item.type}</span>
                                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                                </div>
                                {item.forensicScore && (
                                    <div className={item.forensicScore > 50 ? 'text-red-500' : 'text-green-500'}>AI SCORE: {item.forensicScore}%</div>
                                )}
                                {item.mode && <div>PROTOCOL: {item.mode}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="h-8 bg-black border-t border-zinc-800 flex items-center px-4 text-[10px] text-zinc-600 font-mono gap-4">
            <span>RECORDS: {items.length}</span>
            <span>STORAGE: LOCAL_ENCRYPTED</span>
        </div>
      </div>
    </div>
  );
};

export default MemoryModal;