
import React, { useState } from 'react';
import ParticleScene from './components/ParticleScene';
import ControlPanel from './components/ControlPanel';
import { ParticleConfig } from './types';

// Custom Logo Component - Plain text FKGPT
const FkgptLogo = () => (
    <svg width="200" height="80" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" /> {/* Cyan */}
                <stop offset="100%" stopColor="#a3e635" /> {/* Lime */}
            </linearGradient>
        </defs>
        
        {/* Plain Text Display */}
        <text x="10" y="55" fontFamily="monospace" fontWeight="bold" fontSize="50" fill="url(#grad1)" letterSpacing="10" opacity="1">
            FKGPT
        </text>
    </svg>
);

const App: React.FC = () => {
  // Initial default state with requested parameters
  const [config, setConfig] = useState<ParticleConfig>({
    particleCount: 11000,
    color: '#60a5fa', // blue-400
    shape: 'diamond', 
    speed: 1.7,
    noiseStrength: 0.1,
    size: 0.05,
    text: 'FKGPT' // default text
  });

  return (
    <div className="w-screen h-screen overflow-hidden bg-black text-white relative">
      <ParticleScene config={config} />
      <ControlPanel config={config} setConfig={setConfig} />
      
      {/* Logo Overlay */}
      <div className="absolute top-6 left-8 pointer-events-none select-none z-0">
        <FkgptLogo />
        <p className="text-cyan-400/60 text-xs mt-2 tracking-[0.3em] font-mono ml-2">
            AI-DRIVEN PARTICLE SYSTEM
        </p>
      </div>
    </div>
  );
};

export default App;
