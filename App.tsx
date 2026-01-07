import React, { useState, useRef, useEffect } from 'react';
import { ASPECT_RATIOS, RESOLUTIONS } from './constants';
import ProcessingTerminal from './components/ProcessingTerminal';
import HelpModal from './components/HelpModal';
import MemoryModal from './components/MemoryModal';
import AppLogo from './components/AppLogo';
import { generateHeadshot, editHeadshot, removeGlasses, quickScanImage, analyzeImageCompliance, performForensicScan, applyCounterForensics } from './services/geminiService';
import { loadFaceModels } from './services/faceService';
import { initFaceMesh, stopFaceMesh, opencvSmartCrop } from './services/visionService';
import { classifyImageLocal } from './services/localAIService';
import { storeOperation } from './services/memoryService';
import { AgentMode, AspectRatio, ImageResolution, ForensicScanResult, TextureLevel } from './types';
import { jsPDF } from "jsPDF";

// Refined Icons
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);
const BoltIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);
const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
);

const App = () => {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayAreaRef = useRef<HTMLDivElement>(null);

  // Core State
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'editing' | 'analyzing' | 'complete'>('idle');
  const [selectedMode, setSelectedMode] = useState<AgentMode>(AgentMode.STANDARD);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Settings
  const [syntheticPrompt, setSyntheticPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [dpiSelection, setDpiSelection] = useState<string>('600');
  const [textureLevel, setTextureLevel] = useState<TextureLevel>('enhanced');
  
  // UI State
  const [showHelp, setShowHelp] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraPreview, setCameraPreview] = useState<string | null>(null); 
  const [scanResult, setScanResult] = useState<ForensicScanResult | null>(null);

  const addLog = (msg: string, type: 'info' | 'warn' | 'success' | 'system' = 'info') => {
    const prefixes = { info: 'INFO', warn: 'WARN', success: 'DONE', system: 'SYS' };
    setLogs(prev => [...prev, `${prefixes[type]} :: ${msg}`]);
  };

  useEffect(() => {
    loadFaceModels().then(() => addLog("System initialized.", "success")).catch(() => addLog("Offline mode active.", "warn"));
  }, []);

  const handleFileUpload = (file: File) => {
    const fileName = file.name.toLowerCase();
    const isImage = /\.(jpg|jpeg|png|webp)$/.test(fileName);
    const isPsdOrPdf = /\.(psd|pdf)$/.test(fileName);

    addLog(`Ingesting Master File: ${file.name} [${(file.size / 1024 / 1024).toFixed(2)} MB]`, 'system');
    addLog(`HARDWARE REQUIREMENT: Target output resolution 600-1200 DPI for physical CR80 fabrication (3.375" x 2.125").`, 'info');

    if (isImage) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSourceImage(ev.target?.result as string);
        setGeneratedImages([]);
        addLog("Master image mapped to neural buffer.", "success");
      };
      reader.readAsDataURL(file);
    } else if (isPsdOrPdf) {
      addLog(`Non-visual container detected (${fileName.split('.').pop()?.toUpperCase()}). Processing will continue without local preview.`, 'warn');
      setSourceImage(null);
      setGeneratedImages([]);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    setCameraPreview(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        if (canvasRef.current) initFaceMesh(videoRef.current, canvasRef.current);
      }
      addLog('Camera feed connected.', 'system');
      if (window.innerWidth < 1024) displayAreaRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      addLog('Camera access failed.', 'warn');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = async () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    await stopFaceMesh();
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
      }
      const dataUrl = canvas.toDataURL('image/jpeg');
      setSourceImage(dataUrl);
      setCameraPreview(dataUrl);
      addLog('Photo captured.', 'success');
    }
  };

  const handleGenerate = async () => {
    if (selectedMode === AgentMode.SYNTHETIC && !syntheticPrompt) {
        addLog('Description required for synthesis.', 'warn');
        return;
    }
    if (selectedMode !== AgentMode.SYNTHETIC && !sourceImage) {
        addLog('Input image required.', 'warn');
        return;
    }

    setStatus('processing');
    setLogs([]);
    addLog(`Initiating ${selectedMode} fabrication...`, 'system');

    try {
      const results = await generateHeadshot(sourceImage, syntheticPrompt, selectedMode, aspectRatio, '2K', textureLevel);
      setGeneratedImages(results);
      setSelectedImageIndex(0);
      setStatus('complete');
      addLog(`Fabrication successful. Neural patterns laundered.`, 'success');
      addLog(`METADATA: Canon EOS R5 EXIF headers injected to obfuscate AI origin.`, 'system');
      
      results.forEach(img => storeOperation({ type: 'GENERATION', mode: selectedMode, imageData: img }));
      
      const scan = await performForensicScan(results[0]);
      setScanResult(scan);
    } catch (error) {
      addLog(`Critical Error: ${(error as Error).message}`, 'warn');
      setStatus('idle');
    }
  };

  const handleExport = (format: 'png' | 'pdf') => {
    const activeImage = generatedImages[selectedImageIndex];
    if (!activeImage) return;
    addLog(`Generating ${format.toUpperCase()} export...`, 'system');
    if (format === 'pdf') {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'in', format: [4, 4] });
        doc.addImage(activeImage, 'PNG', 0, 0, 4, 4);
        doc.save(`IDForge_${Date.now()}.pdf`);
    } else {
        const link = document.createElement('a');
        link.href = activeImage;
        link.download = `IDForge_${Date.now()}.png`;
        link.click();
    }
    addLog('Export stream closed.', 'success');
  };

  return (
    <div className="min-h-screen bg-[#030303] text-neutral-400 font-sans flex items-center justify-center p-0 md:p-4 lg:p-8 selection:bg-cyan-500/30 overflow-x-hidden">
      
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showMemory && <MemoryModal onClose={() => setShowMemory(false)} onLoadImage={(b64) => { setSourceImage(b64); setGeneratedImages([]); }} />}

      {/* Luxury Gadget Chassis */}
      <div className="w-full max-w-[1440px] h-full lg:h-[92vh] bg-neutral-900/40 border border-white/5 shadow-2xl rounded-none md:rounded-[2.5rem] overflow-hidden flex flex-col relative backdrop-blur-3xl bevel-border">
        
        {/* Instrumentation Header */}
        <header className="h-16 bg-black border-b border-white/10 px-6 md:px-10 flex items-center justify-between z-50 shrink-0">
          <div className="flex items-center gap-4">
            <AppLogo className="w-7 h-7 md:w-8 md:h-8" />
            <h1 className="text-xs md:text-sm font-black tracking-widest text-white uppercase opacity-80 flex items-center gap-2">
              ID.Forge <span className="text-cyan-500 font-mono text-[9px] px-2 py-0.5 border border-cyan-500/20 bg-cyan-500/5 rounded">v4.1.2 // READY</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <button onClick={() => setShowMemory(true)} className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-neutral-400 hover:text-emerald-500 transition-all uppercase group">
              <HistoryIcon className="group-hover:scale-110 transition-transform" /> <span className="hidden sm:inline">Photo History</span>
            </button>
            <button onClick={() => setShowHelp(true)} className="text-[10px] font-bold tracking-widest text-neutral-500 hover:text-white uppercase px-3 py-1 border border-white/5 rounded-lg hover:bg-white/5">Help</button>
          </div>
        </header>

        <main className="flex flex-col lg:grid lg:grid-cols-12 flex-1 min-h-0 overflow-hidden relative">
          
          {/* Side Control Panel (Left on desktop) */}
          <div className="order-2 lg:order-1 col-span-12 lg:col-span-4 xl:col-span-3 bg-black/40 p-5 md:p-6 lg:p-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar border-t lg:border-t-0 lg:border-r border-white/5 z-20">
            
            {/* Choose Your Style */}
            <section className="space-y-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-600">Choose Your Style</h3>
              <div className="grid grid-cols-1 gap-2">
                {(Object.values(AgentMode)).map(mode => (
                  <button 
                    key={mode} 
                    onClick={() => setSelectedMode(mode)} 
                    className={`text-left px-4 py-4 rounded-xl border transition-all duration-300 relative overflow-hidden group ${selectedMode === mode ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'bg-neutral-900/50 border-white/5 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300'}`}
                  >
                    <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-widest leading-tight">
                            {mode === 'STANDARD' ? "Standard ID / Passport Headshot" : mode === 'DISGUISE' ? 'Privacy Alteration' : 'Create Synthetic Identity'}
                        </span>
                        <span className="text-[9px] opacity-40 font-mono mt-1 leading-normal">
                            {mode === 'STANDARD' 
                              ? "Refines existing photos into compliant, studio-quality ID headshots." 
                              : mode === 'DISGUISE' 
                                ? "Generates a plausible lookalike to evade automated facial recognition." 
                                : "Fabricates an entirely new, photorealistic person from a text prompt."}
                        </span>
                    </div>
                    {selectedMode === mode && <div className="absolute top-0 right-0 w-1 h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>}
                  </button>
                ))}
              </div>
            </section>

            {/* Image Settings */}
            <section className="space-y-3 bg-neutral-900/30 p-4 rounded-2xl border border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-600">Hardware Config</h3>
                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest">Print Quality</span>
                        <select value={dpiSelection} onChange={(e) => setDpiSelection(e.target.value)} className="w-full bg-black/80 border border-white/10 rounded-xl p-3 text-[11px] text-white outline-none focus:border-cyan-500/50 transition-all">
                            <option value="300">Standard (300 DPI)</option>
                            <option value="600">Professional (600 DPI)</option>
                            <option value="1200">Forensic (1200 DPI)</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest">Skin Detail Protocol</span>
                        <div className="flex gap-1.5 p-1 bg-black/60 rounded-xl border border-white/5">
                            {(['natural', 'enhanced'] as TextureLevel[]).map((level) => (
                                <button key={level} onClick={() => setTextureLevel(level)} className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${textureLevel === level ? 'bg-neutral-800 text-cyan-400 shadow-sm border border-white/10' : 'text-neutral-600 hover:text-neutral-400'}`}>
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Add Your Photo Sidebar */}
            <section className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-600">Input Module</h3>
                {selectedMode === AgentMode.SYNTHETIC ? (
                    <textarea 
                        value={syntheticPrompt} 
                        onChange={(e) => setSyntheticPrompt(e.target.value)} 
                        className="w-full bg-neutral-900/50 border border-white/5 rounded-2xl p-4 text-xs text-white placeholder:text-neutral-700 min-h-[120px] outline-none transition-all focus:border-cyan-500/30 custom-scrollbar"
                        placeholder="Define subject traits (e.g. 'Man, 30s, sharp features')..."
                    />
                ) : (
                    <div className="flex flex-col gap-2">
                        <div 
                            onClick={() => fileInputRef.current?.click()} 
                            className="h-28 rounded-2xl border-2 border-dashed border-white/5 hover:border-cyan-500/30 bg-neutral-900/20 hover:bg-cyan-500/5 cursor-pointer flex flex-col items-center justify-center gap-3 text-neutral-600 hover:text-cyan-400 transition-all group"
                        >
                            <div className="p-3 rounded-full bg-white/5 group-hover:bg-cyan-500/10 group-hover:scale-110 transition-all">
                                <UploadIcon />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">Upload Master File</span>
                        </div>
                        <button 
                            onClick={startCamera} 
                            className="w-full py-4 rounded-2xl bg-neutral-900/80 border border-white/5 hover:bg-neutral-800 text-neutral-500 hover:text-white flex items-center justify-center gap-3 text-xs font-bold transition-all"
                        >
                            <CameraIcon /> Launch Viewfinder
                        </button>
                    </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept=".jpg,.jpeg,.png,.psd,.pdf,.webp" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                }} />
            </section>

            {/* Main Action */}
            <div className="mt-auto pt-6">
                <button 
                    onClick={handleGenerate} 
                    disabled={status === 'processing'} 
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-600 to-cyan-400 text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:shadow-cyan-500/20 disabled:grayscale transition-all active:scale-[0.98] flex items-center justify-center gap-4 shimmer-effect"
                >
                    {status === 'processing' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <BoltIcon />}
                    Generate New Headshots
                </button>
            </div>
          </div>

          {/* Main Visual Display (Center) */}
          <div ref={displayAreaRef} className="order-1 lg:order-2 col-span-12 lg:col-span-8 xl:col-span-9 bg-neutral-950/20 relative flex flex-col h-[50vh] lg:h-full overflow-y-auto custom-scrollbar z-10">
            <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 md:p-6 lg:p-8">
                
                {/* Visualizer Content */}
                {(generatedImages.length > 0 || sourceImage) ? (
                    <div className="w-full h-full flex flex-col relative z-10 animate-in fade-in zoom-in duration-500 max-w-5xl mx-auto">
                        <div className="flex-1 flex items-center justify-center relative">
                            {/* The "Viewport" */}
                            <div className="relative group tactile-inset rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-neutral-900 max-w-full max-h-full">
                                {generatedImages.length > 0 ? (
                                    <img src={generatedImages[selectedImageIndex]} className="max-h-[35vh] md:max-h-[45vh] lg:max-h-[55vh] w-auto block object-contain" alt="Synthetic Result" />
                                ) : (
                                    sourceImage && <img src={sourceImage} className="max-h-[35vh] md:max-h-[45vh] lg:max-h-[55vh] w-auto block opacity-50 grayscale" alt="Input Reference" />
                                )}
                                
                                {/* Overlay HUD Elements */}
                                <div className="absolute inset-0 pointer-events-none border border-cyan-500/10 rounded-[2rem] md:rounded-[3rem]"></div>
                                <div className="absolute top-6 left-6 flex flex-col gap-1 pointer-events-none">
                                    <div className="h-1 w-8 bg-cyan-500/40"></div>
                                    <div className="h-8 w-1 bg-cyan-500/40"></div>
                                </div>
                                <div className="absolute bottom-6 right-6 flex flex-col gap-1 items-end pointer-events-none rotate-180">
                                    <div className="h-1 w-8 bg-cyan-500/40"></div>
                                    <div className="h-8 w-1 bg-cyan-500/40"></div>
                                </div>
                            </div>
                        </div>

                        {/* Integrated Controls Bar */}
                        <div className="mt-4 md:mt-6 bg-black/60 backdrop-blur-3xl rounded-[2rem] p-2 md:p-3 flex flex-col sm:flex-row gap-3 items-center shadow-2xl border border-white/5 w-full">
                            {generatedImages.length > 0 && (
                                <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar max-w-[200px] shrink-0">
                                    {generatedImages.map((img, idx) => (
                                        <button key={idx} onClick={() => setSelectedImageIndex(idx)} className={`h-10 w-10 rounded-lg border-2 flex-shrink-0 transition-all ${selectedImageIndex === idx ? 'border-cyan-500 scale-105 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'border-transparent opacity-30 hover:opacity-100'}`}>
                                            <img src={img} className="w-full h-full object-cover rounded-md" />
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="flex-1 flex gap-2 w-full sm:w-auto px-2">
                                <button onClick={() => handleExport('png')} className="flex-1 sm:flex-none px-4 py-3 bg-neutral-900 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    Save Image
                                </button>
                                <button onClick={() => handleExport('pdf')} className="flex-1 sm:flex-none px-4 py-3 bg-neutral-900 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-400 hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                                    Print PDF
                                </button>
                                {sourceImage && generatedImages.length === 0 && (
                                     <button onClick={handleGenerate} className="flex-1 sm:flex-none px-6 py-3 bg-cyan-500 border border-cyan-400 rounded-xl text-[9px] font-black uppercase tracking-widest text-black hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 animate-pulse">
                                        <BoltIcon /> Generate Now
                                     </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-xl lg:max-w-2xl border border-white/5 bg-black/20 rounded-[3rem] p-5 md:p-8 text-center animate-in zoom-in duration-1000 shadow-2xl relative flex flex-col items-center">
                         {/* Corner HUD accents for the Idle Screen */}
                         <div className="absolute top-6 left-6 w-10 h-10 border-t border-l border-white/10 rounded-tl-2xl"></div>
                         <div className="absolute top-6 right-6 w-10 h-10 border-t border-r border-white/10 rounded-tr-2xl"></div>
                         <div className="absolute bottom-6 left-6 w-10 h-10 border-b border-l border-white/10 rounded-bl-2xl"></div>
                         <div className="absolute bottom-6 right-6 w-10 h-10 border-b border-r border-white/10 rounded-br-2xl"></div>

                         <div className="relative inline-block mb-4 md:mb-6">
                             <div className="absolute -inset-12 bg-cyan-500/5 rounded-full blur-[80px]"></div>
                             <div className="p-5 md:p-6 rounded-full border border-white/5 bg-black/20 relative backdrop-blur-sm">
                                <AppLogo className="w-12 h-12 md:w-14 md:h-14 opacity-30" />
                             </div>
                         </div>
                         
                         <div className="space-y-1 relative mb-6 md:mb-8 text-center">
                            <h2 className="text-base md:text-xl font-black text-white tracking-[0.4em] uppercase opacity-40">System Idle</h2>
                            <p className="text-[7px] md:text-[8px] font-mono text-cyan-500/60 tracking-[0.6em] uppercase animate-pulse">Waiting for biometric data stream</p>
                         </div>

                         {/* Quick Ingest Dashboard */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 w-full">
                             
                             {/* Camera Quick Action */}
                             <div className="group relative bg-neutral-900/40 border border-white/5 rounded-[2rem] p-4 md:p-5 flex flex-col items-center justify-center gap-3 md:gap-4 hover:bg-neutral-800/50 hover:border-cyan-500/30 transition-all duration-500">
                                 <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-500">
                                     <CameraIcon />
                                 </div>
                                 <div className="text-center">
                                     <h4 className="text-[8px] md:text-[10px] font-black uppercase text-white tracking-widest mb-0.5">Live Viewfinder</h4>
                                     <p className="text-[6px] md:text-[7px] text-neutral-500 font-mono">Stream biometric markers from device camera</p>
                                 </div>
                                 <button 
                                     onClick={sourceImage ? handleGenerate : startCamera} 
                                     className={`w-full py-2 rounded-xl font-black text-[7px] md:text-[8px] uppercase tracking-[0.2em] transition-all ${sourceImage ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-cyan-400' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'}`}
                                 >
                                     {sourceImage ? 'Generate Headshot' : 'Activate Camera'}
                                 </button>
                             </div>

                             {/* File Quick Action */}
                             <div className="group relative bg-neutral-900/40 border border-white/5 rounded-[2rem] p-4 md:p-5 flex flex-col items-center justify-center gap-3 md:gap-4 hover:bg-neutral-800/50 hover:border-cyan-500/30 transition-all duration-500">
                                 <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-500 text-emerald-500">
                                     <UploadIcon />
                                 </div>
                                 <div className="text-center">
                                     <h4 className="text-[8px] md:text-[10px] font-black uppercase text-white tracking-widest mb-0.5">Local Master</h4>
                                     <p className="text-[6px] md:text-[7px] text-neutral-500 font-mono">Select high-resolution biometric reference file</p>
                                 </div>
                                 <button 
                                     onClick={sourceImage ? handleGenerate : () => fileInputRef.current?.click()} 
                                     className={`w-full py-2 rounded-xl font-black text-[7px] md:text-[8px] uppercase tracking-[0.2em] transition-all ${sourceImage ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-cyan-400' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'}`}
                                 >
                                     {sourceImage ? 'Generate Headshots' : 'Select Photo'}
                                 </button>
                             </div>

                         </div>
                    </div>
                )}

                {/* Viewfinder Overlay */}
                {isCameraOpen && (
                    <div className="absolute inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300 scanlines">
                        <div className="relative w-full max-w-xl aspect-[4/3] rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl bg-zinc-900 group mx-4">
                            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
                            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-10 opacity-30 pointer-events-none scale-x-[-1]" />
                            {cameraPreview && <img src={cameraPreview} className="absolute inset-0 w-full h-full object-cover z-20 scale-x-[-1]" />}
                            
                            {/* Alignment Mask */}
                            <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                                <div className="w-[50%] h-[70%] border-2 border-dashed border-cyan-500/40 rounded-[100%] shadow-[0_0_100px_rgba(0,0,0,0.8)]"></div>
                                <div className="absolute top-1/3 left-0 right-0 h-px bg-cyan-500/20"></div>
                            </div>
                        </div>
                        
                        <div className="mt-6 md:mt-8 flex items-center gap-4 md:gap-6">
                            {!cameraPreview ? (
                                <>
                                    <button onClick={stopCamera} className="px-5 md:px-6 py-2 rounded-xl bg-neutral-900 border border-white/10 text-[8px] md:text-[9px] font-bold text-neutral-500 uppercase tracking-widest hover:text-white transition-all">Abort</button>
                                    <button onClick={capturePhoto} className="w-14 h-14 md:w-16 md:h-16 rounded-full border-[5px] border-neutral-800 bg-white flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-black/10"></div>
                                    </button>
                                    <div className="w-14 md:w-16 opacity-0"></div>
                                </>
                            ) : (
                                <div className="flex gap-3 animate-in slide-in-from-bottom-4 duration-300">
                                    <button onClick={() => setCameraPreview(null)} className="px-5 md:px-8 py-2 md:py-3 rounded-xl bg-neutral-900 border border-white/10 text-neutral-400 font-black text-[9px] md:text-[10px] tracking-widest uppercase hover:bg-neutral-800">Retake</button>
                                    <button onClick={() => { stopCamera(); handleGenerate(); }} className="px-5 md:px-8 py-2 md:py-3 rounded-xl bg-cyan-500 text-black font-black text-[9px] md:text-[10px] tracking-[0.2em] uppercase shadow-xl hover:bg-cyan-400">Accept</button>
                                </div>
                            )}
                        </div>
                        <p className="mt-4 text-[8px] md:text-[9px] font-mono text-cyan-500 uppercase tracking-[0.4em] animate-pulse">
                            {cameraPreview ? 'Pattern Locked' : 'Align eyes to horizontal axis'}
                        </p>
                    </div>
                )}
            </div>
          </div>
        </main>

        {/* System Log Footer */}
        <footer className="h-28 bg-black/60 border-t border-white/5 px-6 py-3 font-mono text-[9px] backdrop-blur-3xl relative shrink-0 z-30">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
          <div className="flex items-center gap-3 mb-2 opacity-30 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
            <span className="uppercase font-black tracking-widest text-[8px]">Real-time Telemetry Feed</span>
          </div>
          <ProcessingTerminal logs={logs} />
        </footer>
      </div>

      {/* Decorative Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  );
};

export default App;