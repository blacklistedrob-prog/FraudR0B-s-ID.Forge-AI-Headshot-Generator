import React, { useState, useRef, useEffect } from 'react';
import { ASPECT_RATIOS, RESOLUTIONS } from './constants';
import ProcessingTerminal from './components/ProcessingTerminal';
import HelpModal from './components/HelpModal';
import AppLogo from './components/AppLogo';
import { generateHeadshot, editHeadshot, quickScanImage, analyzeImageCompliance, performForensicScan, applyCounterForensics } from './services/geminiService';
import { AgentMode, AspectRatio, ImageResolution, ForensicScanResult, TextureLevel } from './types';
import { jsPDF } from "jspdf";

// Icons
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);
const BoltIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
);
const ScanIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/></svg>
);
const KeyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
);
const BugIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="14" x="8" y="2" rx="4"/><path d="m19 7-3 3"/><path d="m5 7 3 3"/><path d="m19 19-3-3"/><path d="m5 19 3-3"/><path d="M2 12h6"/><path d="M16 12h6"/></svg>
);
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
);
const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
);
const HelpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);

const App = () => {
  // State
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'editing' | 'analyzing' | 'complete'>('idle');
  const [selectedMode, setSelectedMode] = useState<AgentMode>(AgentMode.STANDARD);
  const [logs, setLogs] = useState<string[]>([]);
  const [editPrompt, setEditPrompt] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  
  // UI State
  const [showHelp, setShowHelp] = useState(false);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
  
  // Forensic State
  const [scanResult, setScanResult] = useState<ForensicScanResult | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isFixing, setIsFixing] = useState(false); // dedicated loading state for fixes
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Synthetic Mode Inputs
  // DEFAULT SETTINGS UPDATED: 600 DPI (2K)
  const [syntheticPrompt, setSyntheticPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [resolution, setResolution] = useState<ImageResolution>('2K');
  const [dpiSelection, setDpiSelection] = useState<string>('600');
  const [textureLevel, setTextureLevel] = useState<TextureLevel>('enhanced');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string, type: 'info' | 'warn' | 'success' | 'system' = 'info') => {
    const prefixes = { info: 'INFO', warn: 'WARN', success: 'DONE', system: 'SYS' };
    setLogs(prev => [...prev, `${prefixes[type]} :: ${msg}`]);
  };

  // Check API Key status on mount
  useEffect(() => {
    const initKeyCheck = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        } catch (e) {
          console.error("Error checking initial API key status", e);
        }
      }
    };
    initKeyCheck();
  }, []);

  // Load settings on mount
  useEffect(() => {
    const saved = localStorage.getItem('id_forge_config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config.mode) setSelectedMode(config.mode);
        if (config.dpi) {
             setDpiSelection(config.dpi);
             if (config.dpi === '1200') setResolution('4K');
             else if (config.dpi === '600') setResolution('2K');
             else setResolution('1K');
        }
        if (config.aspectRatio) setAspectRatio(config.aspectRatio);
        setTimeout(() => addLog('System configuration restored.', 'system'), 100);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    const config = {
        mode: selectedMode,
        dpi: dpiSelection,
        aspectRatio: aspectRatio
    };
    localStorage.setItem('id_forge_config', JSON.stringify(config));
    addLog('Configuration saved to local storage.', 'success');
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      addLog('Camera stream initialized.', 'system');
    } catch (err) {
      addLog('Failed to access camera.', 'warn');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setSourceImage(dataUrl);
      setLogs([]);
      addLog('Image captured from secure video feed.', 'system');
      stopCamera();
      
      quickScanImage(dataUrl).then(scanResult => {
         addLog(`Scan: ${scanResult}`, 'info');
      });
    }
  };

  useEffect(() => { return () => stopCamera(); }, []);

  const handleDpiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDpiSelection(val);
    if (val === '1200') setResolution('4K');
    else if (val === '600') setResolution('2K');
    else setResolution('1K');
    addLog(`DPI set to ${val} (Res: ${val === '1200' ? '4K' : val === '600' ? '2K' : '1K'})`, 'info');
  };

  const checkApiKey = async () => {
    const requiresPro = selectedMode === AgentMode.SYNTHETIC || resolution === '2K' || resolution === '4K';
    if (requiresPro) {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey); // Sync state
        if (!hasKey) {
            addLog("AUTH REQUIRED: High-DPI/Syn uses Pro Model", "warn");
            return false;
        }
      }
    }
    return true;
  };

  const handleOpenKeySelection = async () => {
    if (window.aistudio) {
        await window.aistudio.openSelectKey();
        if (typeof window.aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setHasApiKey(hasKey);
        }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        setSourceImage(result);
        setLogs([]);
        setGeneratedImages([]);
        setScanResult(null); // Reset scan
        setStatus('idle');
        addLog('File loaded to buffer.', 'system');
        const scanResult = await quickScanImage(result);
        addLog(`Scan: ${scanResult}`, 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!sourceImage) return;
    setStatus('analyzing');
    addLog('Compliance check initialized...', 'system');
    try {
        const report = await analyzeImageCompliance(sourceImage);
        addLog(report.slice(0, 150) + '...', 'info');
    } catch (error) {
        addLog(`Analysis Failed: ${(error as Error).message}`, 'warn');
    } finally {
        setStatus('idle');
    }
  };

  const handleGenerate = async () => {
    const hasKey = await checkApiKey();
    if (!hasKey) return;
    if (selectedMode === AgentMode.SYNTHETIC && !syntheticPrompt) {
        addLog('ERR: Missing description seed.', 'warn');
        return;
    }
    if (selectedMode !== AgentMode.SYNTHETIC && !sourceImage) {
        addLog('ERR: Missing source input.', 'warn');
        return;
    }

    setStatus('processing');
    setLogs([]);
    setGeneratedImages([]);
    setScanResult(null);
    addLog(`EXEC: ${selectedMode} Protocol (x4)...`, 'system');
    addLog(`RES: ${resolution} (${dpiSelection} DPI Target)`, 'info');

    try {
      const results = await generateHeadshot(sourceImage, syntheticPrompt, selectedMode, aspectRatio, resolution, textureLevel);
      setGeneratedImages(results);
      setSelectedImageIndex(0);
      setStatus('complete');
      addLog(`SUCCESS: 4 Identities compiled.`, 'success');

      // Automatic Forensic Scan of the primary result (index 0)
      if (results.length > 0) {
        addLog("AUTO-INIT: Deep Forensic Scan...", "system");
        try {
            const scan = await performForensicScan(results[0]);
            setScanResult(scan);
            setShowOverlay(true);
            const severity = scan.ai_probability_score > 50 ? 'warn' : 'success';
            addLog(`SCAN REPORT: ${scan.ai_probability_score}% AI Probability`, severity);
            if (scan.detections.length > 0) {
                addLog(`ARTIFACTS: ${scan.detections.length} zones flagged.`, 'warn');
            }
        } catch (e) {
            console.error(e);
            addLog("Auto-scan failed to complete.", "warn");
        }
      }

    } catch (error) {
      addLog(`FATAL: ${(error as Error).message}`, 'warn');
      setStatus('idle');
    }
  };

  const handleForensicScan = async () => {
     const activeImage = generatedImages[selectedImageIndex] || sourceImage;
     if (!activeImage) return;
     
     setStatus('analyzing');
     addLog("INIT: Manual Spectral & Diffusion Analysis...", "system");
     setScanResult(null);
     setShowOverlay(false);
     
     // Simulate stepped analysis for UI effect
     setTimeout(() => addLog("Searching for Diffusion Grid Artifacts...", "system"), 500);
     setTimeout(() => addLog("Analyzing Frequency Domain (FFT)...", "system"), 1000);

     try {
        const result = await performForensicScan(activeImage);
        setScanResult(result);
        setShowOverlay(true);
        addLog(`SCAN COMPLETE: AI PROB ${result.ai_probability_score}%`, result.ai_probability_score > 50 ? "warn" : "success");
        result.detections.forEach(d => addLog(`DETECT: ${d.label} (${d.confidence}%)`, "info"));
        setStatus('idle');
     } catch (error) {
         addLog(`SCAN FAIL: ${(error as Error).message}`, "warn");
         setStatus('idle');
     }
  };

  const handleApplyCounterForensics = async () => {
     if (!scanResult || !generatedImages[selectedImageIndex]) {
         addLog("ERROR: No scan result or image to fix.", "warn");
         return;
     }
     
     const activeImage = generatedImages[selectedImageIndex];
     
     setIsFixing(true); // Start loading state for button
     addLog("INITIATING ARTIFACT DESTRUCTION PROTOCOL...", "system");
     addLog("INJECTING STOCHASTIC NOISE PATTERNS...", "system");
     
     try {
         const cleanedImage = await applyCounterForensics(activeImage, scanResult.recommendations);
         // Update current image with cleaned version
         const newImages = [...generatedImages];
         newImages[selectedImageIndex] = cleanedImage;
         setGeneratedImages(newImages);
         setScanResult(null); // Reset scan as it's a new image
         setShowOverlay(false);
         addLog("SUCCESS: DIFFUSION ARTIFACTS NEUTRALIZED.", "success");
         addLog("IMAGE LAUNDERED AND READY FOR EXPORT.", "success");
         setStatus('complete');
     } catch (error) {
         addLog(`FIX FAILED: ${(error as Error).message}`, "warn");
     } finally {
         setIsFixing(false); // Stop loading state
     }
  };

  const handleEdit = async () => {
    const activeImage = generatedImages[selectedImageIndex];
    if (!activeImage || !editPrompt.trim()) return;
    const prevStatus = status;
    setStatus('editing');
    addLog(`Patching V${selectedImageIndex + 1}...`, 'system');

    try {
      const result = await editHeadshot(activeImage, editPrompt);
      const newImages = [...generatedImages];
      newImages[selectedImageIndex] = result;
      setGeneratedImages(newImages);
      setEditPrompt('');
      setScanResult(null);
      addLog('Patch applied.', 'success');
      setStatus('complete');
    } catch (error) {
      addLog(`Edit Failed: ${(error as Error).message}`, 'warn');
      setStatus(prevStatus);
    }
  };

  const handleExport = (format: 'png' | 'jpg' | 'webp' | 'pdf') => {
    const activeImage = generatedImages[selectedImageIndex];
    if (!activeImage) return;
    const link = document.createElement('a');
    
    if (format === 'pdf') {
        // Dynamic PDF Sizing based on Aspect Ratio
        let pdfWidth = 2; // Standard base width (inches)
        let pdfHeight = 2; 

        const [w, h] = aspectRatio.split(':').map(Number);
        if (!isNaN(w) && !isNaN(h) && h !== 0) {
            // Keep width fixed at 2 inches for printing standard
            // Calculate height maintaining aspect ratio
            // Ratio = w / h.  width / height = w / h  => height = width * (h / w)
            pdfHeight = pdfWidth * (h / w);
        }

        const doc = new jsPDF({ 
            orientation: pdfHeight > pdfWidth ? "portrait" : "landscape", 
            unit: "in", 
            format: [pdfWidth, pdfHeight] 
        });
        
        doc.addImage(activeImage, 'PNG', 0, 0, pdfWidth, pdfHeight);
        doc.save(`id-forge-v${selectedImageIndex + 1}.pdf`);
        addLog(`Exported PDF: V${selectedImageIndex + 1} (${pdfWidth}"x${pdfHeight.toFixed(2)}")`, "success");
    } else {
        const img = new Image();
        img.src = activeImage;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if(ctx) {
                if (format === 'jpg') { ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
                ctx.drawImage(img, 0, 0);
                link.href = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : `image/${format}`, 1.0);
                link.download = `id-forge-v${selectedImageIndex + 1}.${format}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                addLog(`Exported ${format.toUpperCase()}`, "success");
            }
        };
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-mono p-2 md:p-4 flex items-center justify-center selection:bg-cyan-500/30">
      
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* Device Chassis */}
      <div className="w-full max-w-6xl bg-zinc-950 border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-lg overflow-hidden relative flex flex-col">
        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-600/50"></div>
        
        {/* Header Bar */}
        <div className="h-14 md:h-10 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 text-xs select-none shrink-0">
          <div className="flex items-center gap-2 font-bold text-cyan-500">
            <AppLogo className="w-6 h-6 md:w-8 md:h-8" />
            <span className="hidden md:inline text-lg tracking-tighter">FraudR0B's ID.Forge</span>
            <span className="md:hidden tracking-tighter">ID.Forge</span>
            <span className="text-zinc-600 font-normal self-end mb-0.5">// v4.1.0</span>
          </div>
          <div className="flex gap-4 items-center">
            
            {/* Help Dropdown */}
            <div className="relative">
                <button 
                  onClick={() => setIsHelpDropdownOpen(!isHelpDropdownOpen)}
                  className="flex items-center gap-1 text-zinc-400 hover:text-cyan-400"
                >
                    <HelpIcon /> <span className="hidden md:inline">HELP</span>
                </button>
                {isHelpDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-black border border-zinc-800 z-50 shadow-lg">
                        <button 
                           onClick={() => { setShowHelp(true); setIsHelpDropdownOpen(false); }}
                           className="w-full text-left px-4 py-2 hover:bg-zinc-900 text-cyan-500"
                        >
                            Open System Manual
                        </button>
                    </div>
                )}
            </div>
            
            <div className="h-4 w-px bg-zinc-800"></div>
            
            <span className="text-zinc-500 hidden md:inline">MEM: 64TB</span>
            <span className="text-zinc-500 hidden md:inline">NET: ENCRYPTED</span>
          </div>
        </div>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 h-auto lg:h-[700px]">
          
          {/* Sidebar / Controls (Order 2 on Mobile, Order 1 on Desktop) */}
          <div className="order-2 lg:order-1 col-span-12 lg:col-span-4 bg-black border-r border-zinc-800 p-4 flex flex-col gap-4 overflow-y-auto border-t lg:border-t-0">
            
            {/* Mode Select */}
            <div className="flex flex-col gap-1">
               <label className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Select Protocol</label>
               {[AgentMode.STANDARD, AgentMode.DISGUISE, AgentMode.SYNTHETIC].map(mode => (
                 <button 
                   key={mode} 
                   onClick={() => setSelectedMode(mode)}
                   className={`text-left px-3 py-2 text-xs border rounded-sm transition-all ${selectedMode === mode ? 'bg-cyan-900/20 border-cyan-600 text-cyan-400' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                 >
                   {mode}
                 </button>
               ))}
               
               {/* Show Key Button if Synthetic OR High Res AND Key not set */}
               {(selectedMode === AgentMode.SYNTHETIC || resolution === '2K' || resolution === '4K') && !hasApiKey && (
                <button onClick={handleOpenKeySelection} className="mt-1 flex items-center gap-2 text-[10px] text-amber-500 border border-amber-900/30 px-2 py-1 rounded-sm"><KeyIcon /> AUTH KEY REQUIRED</button>
               )}
            </div>

            {/* DPI Settings */}
            <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Output DPI (Quality)</label>
                <select 
                    value={dpiSelection}
                    onChange={handleDpiChange} 
                    className="bg-black border border-zinc-800 text-xs p-2 outline-none focus:border-cyan-500 text-zinc-300 rounded-sm"
                >
                    <option value="300">300 DPI (Standard / 1K)</option>
                    <option value="600">600 DPI (High / 2K) [PRO]</option>
                    <option value="1200">1200 DPI (Ultra / 4K) [PRO]</option>
                </select>
                
                {/* Texture/Detail Level */}
                <div className="flex flex-col gap-1 mt-2">
                    <label className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Skin Texture Detail</label>
                    <div className="flex gap-1">
                        {(['smoothed', 'natural', 'enhanced'] as TextureLevel[]).map((level) => (
                            <button
                                key={level}
                                onClick={() => setTextureLevel(level)}
                                className={`flex-1 text-[9px] uppercase border rounded-sm py-1.5 transition-colors ${textureLevel === level ? 'bg-cyan-900/40 border-cyan-500 text-cyan-300' : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
                            >
                                {level === 'enhanced' ? 'Raw/High' : level}
                            </button>
                        ))}
                    </div>
                </div>

                <button onClick={handleSaveSettings} className="mt-2 w-full text-[10px] uppercase font-bold text-zinc-500 hover:text-cyan-400 border border-zinc-800 hover:border-cyan-700 py-1 flex items-center justify-center gap-2 transition-colors">
                    <SaveIcon /> SAVE CONFIG
                </button>
            </div>

            {/* Input Module */}
            <div className="border border-zinc-800 p-2 rounded-sm bg-zinc-900/30">
               <label className="text-[10px] uppercase text-zinc-500 font-bold mb-2 block">
                  {selectedMode === AgentMode.SYNTHETIC ? 'Fabrication Seed' : 'Source Input'}
               </label>
               
               {selectedMode === AgentMode.SYNTHETIC ? (
                 <div className="space-y-2">
                    <textarea 
                        value={syntheticPrompt} onChange={(e) => setSyntheticPrompt(e.target.value)}
                        className="w-full bg-black border border-zinc-700 text-xs p-2 h-20 outline-none focus:border-cyan-500 text-zinc-300 resize-none"
                        placeholder="Identity parameters..."
                    />
                    <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                            {['1:1', '2:3', '4:3'].map(ratio => (
                                <button
                                    key={ratio}
                                    onClick={() => setAspectRatio(ratio as AspectRatio)}
                                    className={`flex-1 text-[10px] border rounded-sm py-1 transition-colors ${aspectRatio === ratio ? 'bg-cyan-900/40 border-cyan-500 text-cyan-300' : 'bg-black border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                        <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="bg-black border border-zinc-700 text-[10px] p-1 text-zinc-400 outline-none w-full">{ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}</select>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-2">
                    {!sourceImage ? (
                        <>
                            <div onClick={() => fileInputRef.current?.click()} className="h-20 border border-dashed border-zinc-700 hover:border-cyan-600 cursor-pointer flex flex-col items-center justify-center text-zinc-500 hover:text-cyan-500 transition-colors">
                                <UploadIcon />
                                <span className="text-[10px] mt-1">UPLOAD</span>
                            </div>
                            <button onClick={startCamera} className="w-full py-2 bg-zinc-800 text-[10px] font-bold text-zinc-300 hover:bg-zinc-700 flex items-center justify-center gap-2"><CameraIcon /> CAM FEED</button>
                        </>
                    ) : (
                        <div className="relative h-28 bg-black border border-zinc-700 group overflow-hidden">
                            <img src={sourceImage} className="w-full h-full object-cover opacity-50" />
                            <div className="absolute inset-0 flex items-center justify-center gap-2">
                                <button onClick={handleAnalyze} disabled={status === 'analyzing'} className="p-1 bg-blue-900/80 hover:bg-blue-800 text-white rounded"><ScanIcon /></button>
                                <button onClick={() => { setSourceImage(null); setGeneratedImages([]); }} className="p-1 bg-red-900/80 hover:bg-red-800 text-white rounded"><RefreshIcon /></button>
                            </div>
                        </div>
                    )}
                 </div>
               )}
               <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
            </div>

            {/* Execute */}
            <button 
                onClick={handleGenerate} disabled={status !== 'idle' && status !== 'complete'}
                className="mt-4 md:mt-auto w-full bg-cyan-700 hover:bg-cyan-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-bold py-3 flex items-center justify-center gap-2 border border-cyan-900 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
            >
                {status === 'processing' ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <BoltIcon />}
                GENERATE HEADSHOTS
            </button>

          </div>

          {/* Viewport (Order 1 on Mobile, Order 2 on Desktop) */}
          <div className="order-1 lg:order-2 col-span-12 lg:col-span-8 bg-zinc-950 relative flex flex-col min-h-[400px] lg:min-h-0">
            <div className="flex-1 relative flex overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')]">
                
                {(generatedImages.length > 0 || sourceImage) ? (
                    <div className="w-full h-full flex flex-col relative">
                        {/* Split View: Image & Sidebar */}
                        <div className="flex-1 flex overflow-hidden relative">
                            
                            {/* Left: Main Image Area */}
                            <div className="flex-1 flex items-center justify-center p-4 relative">
                                <div className="relative max-h-full max-w-full">
                                    <img 
                                        src={generatedImages.length > 0 ? generatedImages[selectedImageIndex] : sourceImage || ""} 
                                        className="max-h-full max-w-full border-2 border-zinc-700 shadow-2xl block" 
                                        alt="Active Result"
                                        style={{maxHeight: '400px'}}
                                    />
                                    
                                    {/* FORENSIC Bounding Boxes Only (HUD) */}
                                    {showOverlay && scanResult && (
                                        <div className="absolute inset-0 pointer-events-none">
                                            {scanResult.detections.map((d, i) => (
                                                <div 
                                                    key={i}
                                                    className={`absolute border-2 ${d.type === 'COMPLIANCE' ? 'border-red-500 bg-red-500/10' : 'border-cyan-400 bg-cyan-400/10'}`}
                                                    style={{
                                                        top: `${d.box_2d[0] / 10}%`,
                                                        left: `${d.box_2d[1] / 10}%`,
                                                        height: `${(d.box_2d[2] - d.box_2d[0]) / 10}%`,
                                                        width: `${(d.box_2d[3] - d.box_2d[1]) / 10}%`
                                                    }}
                                                >
                                                    <div className={`absolute -top-4 left-0 text-[8px] font-bold px-1 ${d.type === 'COMPLIANCE' ? 'bg-red-500 text-white' : 'bg-cyan-400 text-black'}`}>
                                                        {d.label}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Forensic Sidebar Panel (Shows when scanResult exists) */}
                            {scanResult && (
                                <div className="w-72 bg-zinc-950/95 border-l border-zinc-800 p-4 overflow-y-auto backdrop-blur-md animate-in slide-in-from-right absolute right-0 top-0 bottom-0 z-20 md:relative">
                                     <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
                                        <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-500 flex items-center gap-2">
                                            <ShieldIcon /> Forensic Report
                                        </h3>
                                        <button onClick={() => { setScanResult(null); setShowOverlay(false); }} className="text-zinc-500 hover:text-white">✕</button>
                                     </div>

                                     <div className="mb-6 text-center">
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">AI Probability Score</div>
                                        <div className={`text-4xl font-mono font-bold ${scanResult.ai_probability_score > 50 ? 'text-red-500' : 'text-green-500'}`}>
                                            {scanResult.ai_probability_score}%
                                        </div>
                                        <div className="text-[10px] mt-1 text-zinc-400">
                                            {scanResult.ai_probability_score > 50 ? 'HIGH RISK DETECTED' : 'PASSED INSPECTION'}
                                        </div>
                                     </div>

                                     {scanResult.detections.length > 0 && (
                                        <div className="space-y-2 mb-6">
                                            <div className="text-[9px] uppercase text-zinc-600 font-bold">Detected Artifacts</div>
                                            {scanResult.detections.map((d, i) => (
                                                <div key={i} className="bg-zinc-900 border border-zinc-800 p-2 rounded flex justify-between items-center">
                                                    <span className="text-[10px] text-zinc-300">{d.label}</span>
                                                    <span className={`text-[9px] px-1 rounded ${d.type === 'COMPLIANCE' ? 'bg-red-900/50 text-red-400' : 'bg-cyan-900/50 text-cyan-400'}`}>{d.confidence}%</span>
                                                </div>
                                            ))}
                                        </div>
                                     )}

                                     {/* Recommendations & Fix Button */}
                                     {scanResult.ai_probability_score > 20 && (
                                         <div className="mt-auto">
                                             <div className="text-[9px] uppercase text-zinc-600 font-bold mb-2">Counter-Measures</div>
                                             <ul className="text-[9px] text-zinc-500 list-disc pl-3 mb-4 space-y-1">
                                                 {scanResult.recommendations.slice(0, 3).map((rec, i) => <li key={i}>{rec}</li>)}
                                             </ul>
                                             
                                             <button 
                                                onClick={handleApplyCounterForensics}
                                                disabled={isFixing}
                                                className={`w-full py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all rounded-sm border ${isFixing ? 'bg-green-900/20 border-green-500/50 text-green-400 cursor-wait' : 'bg-cyan-900/20 hover:bg-cyan-900/40 border-cyan-500 text-cyan-400'}`}
                                             >
                                                {isFixing ? (
                                                    <>
                                                        <div className="w-3 h-3 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
                                                        APPLYING PATCHES...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldIcon /> AUTO-APPLY FIXES
                                                    </>
                                                )}
                                             </button>
                                         </div>
                                     )}
                                </div>
                            )}

                        </div>
                        
                        {/* Control Bar */}
                        <div className="h-16 flex flex-wrap md:flex-nowrap gap-4 items-center bg-black/80 p-2 border-t border-zinc-800 backdrop-blur-sm overflow-x-auto shrink-0 z-30">
                            {/* Thumbnails */}
                            {generatedImages.length > 0 && (
                                <div className="flex gap-2 shrink-0">
                                    {generatedImages.map((img, idx) => (
                                        <button key={idx} onClick={() => { setSelectedImageIndex(idx); setScanResult(null); setShowOverlay(false); }} className={`h-12 w-12 border ${selectedImageIndex === idx ? 'border-cyan-500 opacity-100' : 'border-zinc-700 opacity-50'} overflow-hidden`}>
                                            <img src={img} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            <div className="hidden md:block h-8 w-px bg-zinc-800 mx-2"></div>
                            
                            {/* Forensic Toggle */}
                            <button 
                                onClick={handleForensicScan} 
                                disabled={status !== 'idle' && status !== 'complete'}
                                className={`px-4 py-2 text-xs font-bold border rounded-sm flex items-center gap-2 whitespace-nowrap ${showOverlay ? 'bg-cyan-900/50 border-cyan-500 text-cyan-400' : 'bg-black border-zinc-700 text-zinc-400 hover:border-cyan-700'}`}
                             >
                                <BugIcon /> RE-SCAN
                             </button>

                            <div className="flex-1 flex gap-2 min-w-[150px]">
                                <input 
                                    value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} 
                                    onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                                    placeholder="Adjust manually..." 
                                    className="flex-1 bg-black border border-zinc-700 text-xs px-2 text-white outline-none focus:border-cyan-500 min-w-0"
                                />
                                <button onClick={handleEdit} className="px-3 bg-zinc-800 text-xs hover:bg-zinc-700 border border-zinc-700">EDIT</button>
                            </div>

                            <div className="flex gap-1">
                                <button onClick={() => handleExport('png')} className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-[10px] hover:text-cyan-400">PNG</button>
                                <button onClick={() => handleExport('jpg')} className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-[10px] hover:text-cyan-400">JPG</button>
                                <button onClick={() => handleExport('pdf')} className="px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-[10px] text-red-400 hover:text-red-300">PDF</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 select-none">
                         <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800 rounded p-6 shadow-2xl backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                               <AppLogo className="w-10 h-10" />
                               <div>
                                   <h2 className="text-xl font-bold text-white tracking-tight">SYSTEM READY</h2>
                                   <p className="text-xs text-cyan-500 font-mono">Awaiting Input Stream...</p>
                               </div>
                            </div>
                            
                            <div className="space-y-4 text-xs font-mono text-zinc-400">
                                <div className="flex items-start gap-3">
                                    <span className="text-cyan-500 font-bold">01</span>
                                    <p>Select Protocol: <span className="text-zinc-300">Standard</span> (Fix), <span className="text-zinc-300">Disguise</span> (Alter), or <span className="text-zinc-300">Synthetic</span> (Fabricate).</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-cyan-500 font-bold">02</span>
                                    <p>Input Source: <span className="text-zinc-300">Upload File</span> or use <span className="text-zinc-300">Secure Cam Feed</span>.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-cyan-500 font-bold">03</span>
                                    <p>Config: Set <span className="text-zinc-300">Skin Texture</span> (Raw/High rec.) and <span className="text-zinc-300">DPI</span> (600 default).</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-cyan-500 font-bold">04</span>
                                    <p>Execute: Click <span className="text-zinc-300">GENERATE</span> to compile 4 variations.</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
                                <button 
                                    onClick={() => setShowHelp(true)}
                                    className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline"
                                >
                                    New User? Access System Manual [HELP]
                                </button>
                            </div>
                         </div>
                    </div>
                )}

                {/* Camera Overlay */}
                {isCameraOpen && (
                    <div className="absolute inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
                        {/* Video Feed - Mirrored for UX */}
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="h-full w-full object-cover opacity-90"
                            style={{ transform: 'scaleX(-1)' }}
                        />
                        
                        {/* Darken edges/vignette */}
                        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.9)_100%)]"></div>

                        {/* Technical Grid Overlay */}
                        <div className="absolute inset-0 pointer-events-none opacity-20" 
                             style={{ backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                        </div>

                        {/* Composition Guides - Rule of Thirds */}
                        <div className="absolute inset-0 pointer-events-none opacity-40">
                            <div className="absolute top-1/3 left-0 right-0 h-px bg-cyan-500/50"></div>
                            <div className="absolute top-2/3 left-0 right-0 h-px bg-cyan-500/50"></div>
                            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-cyan-500/50"></div>
                            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-cyan-500/50"></div>
                        </div>

                        {/* ID Specific Biometric Frame */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                             {/* Face Oval Container */}
                            <div className="relative w-48 h-64 md:w-64 md:h-80 border-2 border-cyan-400/80 rounded-[45%] box-content shadow-[0_0_50px_rgba(34,211,238,0.2)] flex flex-col items-center">
                                
                                {/* Top Head Margin Guide */}
                                <div className="absolute top-4 w-12 h-px bg-red-500/80"></div>
                                <span className="absolute top-1 text-[8px] text-red-500 font-bold uppercase tracking-wider bg-black/50 px-1">Head Top</span>

                                {/* Eye Level Zone */}
                                <div className="absolute top-[40%] w-full h-8 border-y border-dashed border-yellow-500/50 bg-yellow-500/10 flex items-center justify-center">
                                    <div className="w-full h-px bg-yellow-500/50 absolute"></div>
                                    <span className="text-[8px] text-yellow-400 font-bold uppercase tracking-wider bg-black/50 px-1 z-10">Eye Level</span>
                                </div>
                                
                                {/* Vertical Center Line */}
                                <div className="absolute top-0 bottom-0 w-px bg-cyan-500/40"></div>
                                
                                {/* Chin Guide */}
                                <div className="absolute bottom-8 w-12 h-px bg-red-500/80"></div>
                                <span className="absolute bottom-5 text-[8px] text-red-500 font-bold uppercase tracking-wider bg-black/50 px-1">Chin</span>

                                {/* Corner Brackets */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500"></div>
                            </div>
                        </div>
                        
                        {/* Shoulder Guide Hint */}
                        <div className="absolute bottom-[15%] w-full flex justify-center pointer-events-none opacity-60">
                            <div className="w-full max-w-lg border-t-2 border-dashed border-zinc-400 flex justify-between items-start px-4">
                                <span className="bg-black/50 px-2 text-[9px] text-zinc-300">L. SHOULDER</span>
                                <span className="bg-black/50 px-2 text-[9px] text-zinc-300">R. SHOULDER</span>
                            </div>
                        </div>

                        {/* Real-time Instructions */}
                        <div className="absolute top-20 left-0 right-0 flex flex-col items-center pointer-events-none gap-2">
                             <div className="bg-black/80 border border-cyan-900/50 px-4 py-2 rounded text-center backdrop-blur-sm">
                                <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1">Composition Check</p>
                                <ul className="text-[10px] text-zinc-400 text-left space-y-1">
                                    <li className="flex items-center gap-1"><span className="text-green-500">✓</span> Face forward, no tilt</li>
                                    <li className="flex items-center gap-1"><span className="text-green-500">✓</span> Neutral expression</li>
                                    <li className="flex items-center gap-1"><span className="text-green-500">✓</span> Even lighting on face</li>
                                </ul>
                             </div>
                        </div>

                        {/* UI Controls */}
                        <div className="absolute bottom-8 flex gap-6 z-50">
                            <button onClick={stopCamera} className="px-6 py-2 bg-red-950/90 hover:bg-red-900 text-red-200 text-xs font-bold border border-red-800 rounded-sm transition-colors">ABORT</button>
                            <button onClick={capturePhoto} className="px-8 py-2 bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 text-xs font-bold border border-cyan-500 rounded-sm shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                                CAPTURE FRAME
                            </button>
                        </div>
                        
                        {/* Status Text */}
                        <div className="absolute top-6 left-0 right-0 text-center pointer-events-none">
                            <span className="bg-black/70 px-4 py-1.5 rounded-sm text-[10px] text-cyan-400 border border-cyan-900/50 font-mono tracking-wider animate-pulse">
                                SECURITY FEED ACTIVE // ALIGN BIOMETRICS
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Terminal Panel */}
            <div className="h-32 bg-black border-t border-zinc-800 p-2 font-mono text-[10px] overflow-hidden shrink-0">
                <div className="text-zinc-500 mb-1 px-2">SYSTEM LOG //</div>
                <ProcessingTerminal logs={logs} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;