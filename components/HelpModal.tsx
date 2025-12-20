import React, { useState } from 'react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'walkthrough' | 'faq' | 'tips' | 'contact'>('manual');

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
            ID.FORGE MANUAL <span className="hidden md:inline">// v4.1.0</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-red-500 font-mono text-xs">[CLOSE]</button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Sidebar (Tabs) */}
          <div className="w-full md:w-64 bg-black border-b md:border-b-0 md:border-r border-zinc-800 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0">
            <div className="hidden md:block px-4 py-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Database</div>
            <TabButton id="manual" label="SYSTEM PROTOCOLS" />
            <TabButton id="walkthrough" label="WALKTHROUGHS" />
            <TabButton id="faq" label="F.A.Q." />
            <TabButton id="tips" label="PRO TIPS" />
            <TabButton id="contact" label="CONTACT" />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 font-mono text-zinc-300">
            
            {activeTab === 'manual' && (
              <div className="space-y-8 max-w-3xl">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-cyan-400 mb-2">System Overview</h2>
                  <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                    ID.Forge is a multi-agent AI system designed to generate AAMVA-compliant government ID headshots. It utilizes advanced computer vision and generative diffusion models to reconstruct input data into standardized biometric formats.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="border border-zinc-800 p-4 bg-zinc-900/30 rounded">
                    <h3 className="text-cyan-300 font-bold mb-2">Protocol: STANDARD</h3>
                    <p className="text-xs text-zinc-400">
                      **Function:** Image-to-Image Refinement.<br/>
                      **Use Case:** Converting a user's existing photo into a compliant ID.<br/>
                      **Behavior:** Strict fidelity to the subject's identity. Fixes lighting, background (Studio Blue), posture, and expression without altering facial structure.
                    </p>
                  </div>

                  <div className="border border-zinc-800 p-4 bg-zinc-900/30 rounded">
                    <h3 className="text-purple-300 font-bold mb-2">Protocol: DISGUISE</h3>
                    <p className="text-xs text-zinc-400">
                      **Function:** Identity Obfuscation.<br/>
                      **Use Case:** Privacy protection and facial recognition evasion.<br/>
                      **Behavior:** Maintains basic facial landmarks for plausibility but alters key features (hair, weight, age) to create a "digital cousin" of the subject.
                    </p>
                  </div>

                  <div className="border border-zinc-800 p-4 bg-zinc-900/30 rounded">
                    <h3 className="text-amber-300 font-bold mb-2">Protocol: SYNTHETIC</h3>
                    <p className="text-xs text-zinc-400">
                      **Function:** Text-to-Image Fabrication.<br/>
                      **Use Case:** Creating entirely fake personas ("Ghosts").<br/>
                      **Behavior:** Generates a photorealistic human from a text description seed. Requires no image input.
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-zinc-800 pt-6">
                    <h3 className="text-lg font-bold text-white mb-4">Texture & Materiality Engine</h3>
                    <p className="text-xs text-zinc-400 mb-4">
                        The new v4.1.0 update introduces granular control over skin generation.
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <li className="bg-black border border-zinc-800 p-3 rounded">
                            <strong className="text-cyan-400 block mb-1">SMOOTHED</strong>
                            <span className="text-[10px] text-zinc-500">Commercial retouching style. Flattering, reduces acne/wrinkles. Best for social profiles.</span>
                        </li>
                        <li className="bg-black border border-zinc-800 p-3 rounded">
                            <strong className="text-cyan-400 block mb-1">NATURAL</strong>
                            <span className="text-[10px] text-zinc-500">Standard photography. Balanced sharpness. The default "Camera" look.</span>
                        </li>
                        <li className="bg-black border border-zinc-800 p-3 rounded">
                            <strong className="text-cyan-400 block mb-1">RAW / HIGH</strong>
                            <span className="text-[10px] text-zinc-500">Forensic grade. Max texture, pores, vellus hair, and imperfections. Essential for passing AI detection.</span>
                        </li>
                    </ul>
                </div>

                <div>
                   <h3 className="text-lg md:text-xl font-bold text-white mb-4">Forensic Capabilities</h3>
                   <ul className="list-disc pl-5 space-y-2 text-xs text-zinc-400">
                      <li><strong className="text-cyan-400">Spectral Scan:</strong> Analyzes Frequency Domain (FFT) to find "Spectral Smoothness" (waxy skin typical of AI).</li>
                      <li><strong className="text-cyan-400">Diffusion Grid Detection:</strong> Hunts for checkerboard artifacts left by upscalers.</li>
                      <li><strong className="text-cyan-400">Counter-Measures:</strong> Injects stochastic Poisson noise and dithering to mimic a raw camera sensor (Sony A7R profile).</li>
                   </ul>
                </div>
              </div>
            )}

            {activeTab === 'walkthrough' && (
               <div className="space-y-12 max-w-3xl">
                 {/* Walkthrough 1 */}
                 <div className="border-l-2 border-cyan-600 pl-6">
                   <h3 className="text-lg md:text-xl font-bold text-white mb-2">Op 1: The "Passport-Ready" Upload</h3>
                   <p className="text-xs text-zinc-500 mb-4">Objective: Convert a casual gallery photo into a compliant US Passport photo.</p>
                   <ol className="list-decimal pl-4 space-y-3 text-xs md:text-sm text-zinc-300">
                     <li>Set <strong>Protocol</strong> to <span className="text-cyan-400">STANDARD</span>.</li>
                     <li>Click the <strong>UPLOAD</strong> box or drag-and-drop a photo.</li>
                     <li>Set <strong>Output DPI</strong> to <strong>600 (High)</strong> for printing.</li>
                     <li>Set <strong>Texture</strong> to <span className="text-cyan-400">RAW/HIGH</span> to ensure realistic skin details (critical for passports).</li>
                     <li>Click <strong>GENERATE HEADSHOTS</strong>. The system will generate 4 variations.</li>
                     <li>Select your favorite. If needed, click <strong>SPECTRAL SCAN</strong> then <strong>APPLY COUNTER-MEASURES</strong>.</li>
                     <li>Click <strong>PDF</strong> export. Prints perfectly at 2x2 inches.</li>
                   </ol>
                 </div>

                 {/* Walkthrough 2 */}
                 <div className="border-l-2 border-cyan-600 pl-6">
                   <h3 className="text-lg md:text-xl font-bold text-white mb-2">Op 2: The Secure Selfie Capture</h3>
                   <p className="text-xs text-zinc-500 mb-4">Objective: Use the device camera to take a perfectly aligned source image.</p>
                   <ol className="list-decimal pl-4 space-y-3 text-xs md:text-sm text-zinc-300">
                     <li>Click <strong>CAM FEED</strong>. The interface will overlay a biometric HUD.</li>
                     <li>Align your face within the <strong>dashed oval</strong>. Match eyes to the <strong>EYE LINE</strong>.</li>
                     <li>Click <strong>CAPTURE FRAME</strong>.</li>
                     <li>Follow generation steps. Use <span className="text-cyan-400">NATURAL</span> texture if lighting is poor.</li>
                   </ol>
                 </div>

                 {/* Walkthrough 3 */}
                 <div className="border-l-2 border-purple-500 pl-6">
                   <h3 className="text-lg md:text-xl font-bold text-white mb-2">Op 3: The "Doppelgänger" Disguise</h3>
                   <p className="text-xs text-zinc-500 mb-4">Objective: Create an ID photo that looks like you, but isn't you.</p>
                   <ol className="list-decimal pl-4 space-y-3 text-xs md:text-sm text-zinc-300">
                     <li>Set <strong>Protocol</strong> to <span className="text-purple-400">DISGUISE</span>.</li>
                     <li>Upload a clear photo of your target.</li>
                     <li>Use <span className="text-cyan-400">SMOOTHED</span> texture to slightly blur distinctive scars/marks.</li>
                     <li>Click <strong>GENERATE</strong>.</li>
                     <li>Review results. Variations 3/4 have heavier alterations.</li>
                   </ol>
                 </div>

                 {/* Walkthrough 4 */}
                 <div className="border-l-2 border-amber-500 pl-6">
                   <h3 className="text-lg md:text-xl font-bold text-white mb-2">Op 4: The Synthetic Ghost</h3>
                   <p className="text-xs text-zinc-500 mb-4">Objective: Create a completely fake person.</p>
                   <ol className="list-decimal pl-4 space-y-3 text-xs md:text-sm text-zinc-300">
                     <li>Set <strong>Protocol</strong> to <span className="text-amber-400">SYNTHETIC</span>. (Requires API Key).</li>
                     <li>Enter Description: <em>"Female, 20s, glasses, freckles."</em></li>
                     <li>Set <strong>Resolution</strong> to <strong>2K</strong>. Texture to <strong>RAW</strong>.</li>
                     <li>Click <strong>GENERATE</strong>.</li>
                   </ol>
                 </div>
               </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-6 max-w-3xl">
                {[
                  { q: "What does the 'Texture Detail' setting do?", a: "It controls the micro-surface generation of the skin. 'Smoothed' removes blemishes (like a beauty filter). 'Natural' is standard photography. 'Raw/High' forces the AI to render individual pores, vellus hair, and irregularities to defeat deepfake detection scanners." },
                  { q: "Is this tool legal to use?", a: "ID.Forge is an educational tool for testing biometric compliance. Forging government documents for fraud is a federal offense. Use responsibly." },
                  { q: "Why is the default DPI now 600?", a: "We updated the default to 600 DPI (2K resolution) to ensure all generated IDs meet the strict printing standards of modern PVC card printers." },
                  { q: "Why do I need an API Key for Synthetic mode?", a: "Synthetic generation and 4K outputs use the 'Gemini 3 Pro' model, which incurs higher computational costs." },
                  { q: "What is 'Spectral Smoothness'?", a: "AI generators tend to predict the 'average' value of a pixel cluster, removing the random high-frequency noise found in real camera sensors. This creates a 'waxy' look." },
                  { q: "Can I print these directly?", a: "Yes. Export as PDF or PNG. The output is pre-cropped to 1:1." },
                  { q: "Who is FraudR0B?", a: "A sentient AI construct specializing in security research. Or just a cool dev. You decide." }
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
                <h3 className="text-lg md:text-xl font-bold text-white mb-6">20 Pro Tips & Tricks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Use RAW/HIGH texture for any image intended for printing.",
                    "Use SMOOTHED texture if you want to look younger/better.",
                    "Input photos with even lighting yield the best results.",
                    "Avoid hair covering the eyebrows in source photos.",
                    "Glasses are usually removed by the AI for compliance.",
                    "To keep glasses, specify 'wearing reading glasses' in Edit mode.",
                    "Use 'Synthetic' mode to generate diverse test data.",
                    "Always run 'Spectral Scan' before final export.",
                    "If AI Probability > 50%, always apply Counter-Measures.",
                    "Use 'Edit' to change clothing colors (e.g., 'Change suit to black').",
                    "Export to PDF for exact physical print sizing.",
                    "DPI of 600 is recommended for Dye-Sub printers.",
                    "The 'Save Config' button persists your DPI/Mode settings.",
                    "Double-click the camera overlay to reset focus (if supported).",
                    "Use the 'Rule of Thirds' grid to align eyes to the top line.",
                    "Don't smile too wide; 'Neutral Expression' is stricter than you think.",
                    "Synthetic prompts work best with age/gender/ethnicity details.",
                    "Counter-Measures add 'grain'; this is intentional.",
                    "Reload the page to clear the memory buffer instantly.",
                    "Use 'Disguise' mode to create privacy-safe avatars."
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
                  <p className="text-cyan-500 font-mono text-sm mt-1">Skynet-Level AI Assistance // Identity Architect</p>
                </div>
                <div className="bg-zinc-900 p-6 rounded border border-zinc-800 text-center space-y-4 max-w-md">
                  <p className="text-sm text-zinc-400">
                    "I build tools for the ones who need to vanish. Or just the ones who need a passport photo and don't want to go to CVS."
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