import React, { useState } from 'react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'walkthrough' | 'advanced' | 'faq' | 'tips' | 'contact'>('manual');

  const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`text-left px-4 py-3 text-xs font-mono transition-all whitespace-nowrap md:whitespace-normal
        ${activeTab === id 
          ? 'border-b-2 md:border-b-0 md:border-l-2 border-cyan-500 bg-cyan-950/30 text-cyan-400' 
          : 'border-b-2 md:border-b-0 md:border-l-2 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl h-full md:h-[85vh] bg-zinc-950 border border-zinc-800 shadow-[0_0_50px_rgba(6,182,212,0.1)] flex flex-col rounded-sm overflow-hidden">
        
        {/* Header */}
        <div className="h-12 bg-black border-b border-zinc-800 flex items-center justify-between px-6 select-none shrink-0">
          <div className="flex items-center gap-2 text-cyan-500 font-mono font-bold text-xs md:text-sm">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
            ID.FORGE USER GUIDE <span className="hidden md:inline">// v4.1.2</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-red-500 font-mono text-xs uppercase">[Close]</button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Sidebar (Tabs) */}
          <div className="w-full md:w-64 bg-black border-b md:border-b-0 md:border-r border-zinc-800 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0">
            <div className="hidden md:block px-4 py-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Library</div>
            <TabButton id="manual" label="CHOOSE YOUR STYLE" />
            <TabButton id="walkthrough" label="STEP-BY-STEP" />
            <TabButton id="advanced" label="ADVANCED SETTINGS" />
            <TabButton id="faq" label="COMMON QUESTIONS" />
            <TabButton id="tips" label="PRO TIPS" />
            <TabButton id="contact" label="SUPPORT" />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 font-mono text-zinc-300">
            
            {activeTab === 'manual' && (
              <div className="space-y-8 max-w-3xl">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-cyan-400 mb-2">Introduction</h2>
                  <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                    ID.Forge uses advanced AI to help you create and refine professional headshots. Whether you're fixing a photo for an ID or creating a new digital identity, our system handles the lighting, background, and cropping automatically.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="border border-zinc-800 p-4 bg-zinc-900/30 rounded">
                    <h3 className="text-cyan-300 font-bold mb-2 uppercase">Standard Driver's License / Passport Headshot</h3>
                    <p className="text-xs text-zinc-400">
                      **Goal:** Fix a photo you already have.<br/>
                      **How it works:** It takes your existing face and cleans up the lighting, background (to Studio Blue), and centers it perfectly according to passport standards.
                    </p>
                  </div>

                  <div className="border border-zinc-800 p-4 bg-zinc-900/30 rounded">
                    <h3 className="text-purple-300 font-bold mb-2">Privacy Alteration</h3>
                    <p className="text-xs text-zinc-400">
                      **Goal:** Protect your identity online.<br/>
                      **How it works:** It creates a "lookalike" of your face. It keeps your general features so it's recognizable but changes enough details to evade some facial recognition scanners.
                    </p>
                  </div>

                  <div className="border border-zinc-800 p-4 bg-zinc-900/30 rounded">
                    <h3 className="text-amber-300 font-bold mb-2 uppercase">Create Synthetic Headshot</h3>
                    <p className="text-xs text-zinc-400">
                      **Goal:** Generate a completely new identity from scratch.<br/>
                      **How it works:** Just type in a description (like "Man, 30s, short hair") and the system will build a realistic person that doesn't exist in real life.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'walkthrough' && (
               <div className="space-y-12 max-w-3xl">
                 <div className="border-l-2 border-cyan-600 pl-6">
                   <h3 className="text-lg md:text-xl font-bold text-white mb-2">Fixing an existing photo</h3>
                   <p className="text-xs text-zinc-500 mb-4">Use this to turn a selfie into a professional ID headshot.</p>
                   <ol className="list-decimal pl-4 space-y-3 text-xs md:text-sm text-zinc-300">
                     <li>Pick <span className="text-cyan-400 font-bold uppercase">Standard Driver's License / Passport Headshot</span> from the list.</li>
                     <li>Click <strong>Upload File</strong> or drag your photo onto the box.</li>
                     <li>Set <strong>Quality</strong> to 600 DPI.</li>
                     <li>Set <strong>Skin Detail</strong> to <span className="text-cyan-400">Natural</span>.</li>
                     <li>Click <strong>Generate Headshots</strong>.</li>
                     <li>Pick your favorite from the results and click <strong>Save Image</strong>.</li>
                   </ol>
                 </div>

                 <div className="border-l-2 border-cyan-600 pl-6">
                   <h3 className="text-lg md:text-xl font-bold text-white mb-2">Taking a live photo</h3>
                   <p className="text-xs text-zinc-500 mb-4">Use your webcam or phone camera to get a perfect shot.</p>
                   <ol className="list-decimal pl-4 space-y-3 text-xs md:text-sm text-zinc-300">
                     <li>Click <strong>Use Camera</strong>.</li>
                     <li>Line up your face inside the guides on the screen.</li>
                     <li>Click the shutter button to <strong>Capture Photo</strong>.</li>
                     <li>Confirm the photo is good, then click <strong>Generate Headshots</strong>.</li>
                   </ol>
                 </div>

                 <div className="border-l-2 border-purple-500 pl-6">
                   <h3 className="text-lg md:text-xl font-bold text-white mb-2">Creating a "Ghost" Identity</h3>
                   <p className="text-xs text-zinc-500 mb-4">Create a high-quality person that doesn't exist.</p>
                   <ol className="list-decimal pl-4 space-y-3 text-xs md:text-sm text-zinc-300">
                     <li>Pick <span className="text-purple-400 font-bold uppercase">Create Synthetic Headshot</span>.</li>
                     <li>In the text box, describe the person (e.g., "Middle aged man with short hair").</li>
                     <li>Set <strong>Skin Detail</strong> to <span className="text-cyan-400">Enhanced</span> for maximum realism.</li>
                     <li>Click <strong>Generate Headshots</strong>.</li>
                   </ol>
                 </div>
               </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-10 max-w-4xl">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-cyan-400 mb-4 tracking-tighter uppercase">Hardware & Output Config</h2>
                  <p className="text-xs md:text-sm text-zinc-400 leading-relaxed mb-6">
                    Fine-tune the fabrication module for specific hardware requirements. 
                    These settings affect the final neural footprint and physical print viability.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Resolution Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2 uppercase">
                      <span className="text-cyan-500">01 //</span> Image Resolution
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800">
                        <strong className="text-cyan-400 block text-xs mb-1">1K (Standard)</strong>
                        <p className="text-[10px] text-zinc-500 italic">Fastest generation. Perfect for digital avatars or standard web-based identity verification.</p>
                      </div>
                      <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800">
                        <strong className="text-cyan-400 block text-xs mb-1">2K (Professional)</strong>
                        <p className="text-[10px] text-zinc-500 italic">High fidelity. Recommended for standard PVC card printing (300 DPI) and full-screen biometric checks.</p>
                      </div>
                      <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800">
                        <strong className="text-cyan-400 block text-xs mb-1">4K (Forensic)</strong>
                        <p className="text-[10px] text-zinc-500 italic">Maximum density. Sharpest detail for professional CR80 fabrication at 600-1200 DPI.</p>
                      </div>
                    </div>
                  </div>

                  {/* Texture Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2 uppercase">
                      <span className="text-cyan-500">02 //</span> Skin Detail Protocol
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800">
                        <strong className="text-emerald-400 block text-xs mb-1">NATURAL</strong>
                        <p className="text-[10px] text-zinc-500 italic">Standard professional photography. Sharp focus. Real skin texture with authentic minor imperfections.</p>
                      </div>
                      <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800">
                        <strong className="text-emerald-400 block text-xs mb-1">SMOOTHED</strong>
                        <p className="text-[10px] text-zinc-500 italic">Retouched ID look. Skin is subtly evened out but retains pore structure to remain compliant.</p>
                      </div>
                      <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800">
                        <strong className="text-emerald-400 block text-xs mb-1">ENHANCED</strong>
                        <p className="text-[10px] text-zinc-500 italic">Forensic Macro Realism. Renders deep pore maps, peach fuzz, and distinct irregularities to mimic a raw CMOS sensor.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-950/20 border border-cyan-900/50 p-4 rounded mt-8">
                  <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-2">Technical Warning</h4>
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    Setting higher resolutions (4K) combined with 'Enhanced' detail increases processing time significantly. 
                    This combination is strictly designed for physical card fabrication where micro-texture is required to pass forensic inspection.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-6 max-w-3xl">
                {[
                  { q: "What is Skin Detail?", a: "It's how the AI handles skin. 'Natural' is for everyday use. 'Enhanced' adds micro-textures like pores and fine hairs to make the photo pass advanced biometric security checks." },
                  { q: "Why 600 DPI?", a: "Professional card printers usually print at 300 or 600 DPI. Using 600 ensures your photo looks sharp and clear when printed on plastic." },
                  { q: "Can I use this for official documents?", a: "This tool is for testing and personal use. While the photos meet standards, you should always check your local laws before using AI-generated photos for government documents." },
                  { q: "What does 'Save Image' do?", a: "It downloads the result as a PNG file to your device. 'Print PDF' gives you a document ready for physical printing at the correct size." }
                ].map((item, i) => (
                  <div key={i} className="bg-zinc-900/40 p-4 rounded border border-zinc-800">
                    <div className="text-cyan-400 font-bold text-sm mb-2">Q: {item.q}</div>
                    <div className="text-zinc-400 text-xs leading-relaxed">{item.a}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="max-w-3xl">
                <h3 className="text-lg md:text-xl font-bold text-white mb-6">Expert Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Use Enhanced Detail if you plan to print the photo.",
                    "Even lighting on your face gives the best results.",
                    "Try to keep a neutral expression (no big smiles).",
                    "If you wear glasses, the system will often try to remove them for ID compliance.",
                    "Use the 'Photo History' to quickly switch between your recent creations.",
                    "On mobile, use the vertical guides to center your eyes.",
                    "You can print the PDF directly at home; it's pre-sized for ID cards.",
                    "Try different descriptions in 'Create Synthetic Headshot' for varied results."
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-2 items-start text-xs text-zinc-400">
                      <span className="text-cyan-600 font-bold">{i+1}.</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="w-24 h-24 bg-cyan-950 rounded-full flex items-center justify-center border-2 border-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
                  <span className="text-4xl">🤖</span>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-widest">FraudR0B</h2>
                  <p className="text-cyan-500 font-mono text-sm mt-1">AI Identity Architect</p>
                </div>
                <div className="bg-zinc-900 p-6 rounded border border-zinc-800 text-center space-y-4 max-w-md">
                  <p className="text-sm text-zinc-400">
                    "I build high-end tools to make identity fabrication accessible and professional."
                  </p>
                  <div className="pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Secure Comms</p>
                    <a href="mailto:blacklistedrob@gmail.com" className="text-cyan-400 hover:text-cyan-300 font-mono text-lg break-all">blacklistedrob@gmail.com</a>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;