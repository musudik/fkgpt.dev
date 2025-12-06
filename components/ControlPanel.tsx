
import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { ParticleConfig, ShapeType, AIState } from '../types';
import { generateConfigFromPrompt } from '../services/geminiService';
import { Settings2, Sparkles, Loader2, AlertCircle, Play, Pause, Palette } from 'lucide-react';

interface ControlPanelProps {
  config: ParticleConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParticleConfig>>;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig }) => {
  const [prompt, setPrompt] = useState('');
  const [aiState, setAiState] = useState<AIState>({ isLoading: false, error: null });
  const [isOpen, setIsOpen] = useState(true);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isRandomColor, setIsRandomColor] = useState(false);

  // Grouped shapes for better organization
  const shapes: ShapeType[] = [
    'sphere', 'cube', 'diamond', 'torus', 'spiral', 'grid',
    'galaxy', 'solar_system', 'comet', 'ocean', 'tree', 'bear',
    'car', 'heart', 'dna',
    'dollar', 'euro', 'bitcoin', 'yen', 'text'
  ];

  // Auto Mode Logic (Shapes)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAutoMode) {
      interval = setInterval(() => {
        setConfig(prev => {
          // Filter out text mode for auto-rotation to avoid empty text issues unless configured
          const autoShapes = shapes.filter(s => s !== 'text'); 
          const currentIndex = autoShapes.indexOf(prev.shape as any);
          const nextIndex = (currentIndex + 1) % autoShapes.length;
          return { ...prev, shape: autoShapes[nextIndex] };
        });
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [isAutoMode, setConfig]);

  // Random Color Logic - Smooth Transition
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRandomColor) {
      interval = setInterval(() => {
        setConfig(prev => {
            // Use THREE.Color to handle smooth hue shifting
            const color = new THREE.Color(prev.color);
            const hsl = { h: 0, s: 0, l: 0 };
            color.getHSL(hsl);
            
            // Shift hue by 5% (approx 18 degrees) to ensure smooth transition but noticeable change
            // This keeps the color in the "0-255 range" valid and avoids jarring random jumps
            hsl.h = (hsl.h + 0.05) % 1.0;
            
            // Re-assign new color preserving saturation and lightness if possible, 
            // or default to high saturation for vibrancy if input was grayscale.
            if (hsl.s === 0) hsl.s = 0.8;
            if (hsl.l === 0 || hsl.l === 1) hsl.l = 0.5;

            color.setHSL(hsl.h, hsl.s, hsl.l);
            
            return { ...prev, color: '#' + color.getHexString() };
        });
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isRandomColor, setConfig]);

  const handleAIRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setAiState({ isLoading: true, error: null });
    // Disable auto modes if user triggers AI to prevent overriding
    setIsAutoMode(false); 
    setIsRandomColor(false);

    try {
      const newConfig = await generateConfigFromPrompt(prompt);
      setConfig(prev => ({ ...prev, ...newConfig }));
    } catch (err) {
      setAiState({ isLoading: false, error: "Failed to generate config. Try a different prompt." });
    } finally {
      setAiState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className={`fixed right-0 top-0 h-full transition-transform duration-300 z-10 flex ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Toggle Button */}
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="absolute left-0 top-6 -translate-x-full bg-black/50 backdrop-blur-md p-3 rounded-l-lg border-l border-t border-b border-white/10 text-white hover:bg-white/10 transition-colors"
        >
            <Settings2 size={20} />
        </button>

        {/* Panel Content */}
        <div className="w-80 h-full bg-black/80 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto text-gray-200 shadow-2xl pb-20">
            <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                <Sparkles size={20} className="text-purple-400"/> Nebula Control
            </h2>

            {/* AI Section */}
            <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    AI Generator
                </label>
                <form onSubmit={handleAIRequest} className="space-y-3">
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe a mood or scene..."
                        className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none h-24 text-white placeholder-gray-500"
                    />
                    <button 
                        type="submit"
                        disabled={aiState.isLoading || !process.env.API_KEY}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-medium py-2 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {aiState.isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                        {process.env.API_KEY ? 'Generate' : 'API Key Missing'}
                    </button>
                    {aiState.error && (
                        <div className="text-red-400 text-xs flex items-center gap-1 mt-2">
                            <AlertCircle size={12} /> {aiState.error}
                        </div>
                    )}
                </form>
            </div>

            <hr className="border-white/10 mb-8" />

            {/* Manual Controls */}
            <div className="space-y-6">
                
                {/* Auto Mode Toggle */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-sm font-medium text-white">Auto Shape (10s)</span>
                    <button
                        onClick={() => setIsAutoMode(!isAutoMode)}
                        className={`p-2 rounded-full transition-colors ${isAutoMode ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                        {isAutoMode ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                </div>

                {/* Random Colors Checkbox */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2">
                        <Palette size={16} className="text-pink-400"/>
                        <span className="text-sm font-medium text-white">Random Colors (5s)</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={isRandomColor} 
                            onChange={(e) => setIsRandomColor(e.target.checked)}
                            className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                </div>

                <div>
                    <label className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Shape ({shapes.length})
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {shapes.map(s => (
                            <button
                                key={s}
                                onClick={() => {
                                    setConfig(p => ({ ...p, shape: s }));
                                    setIsAutoMode(false); 
                                }}
                                className={`px-1 py-2 rounded-md text-[9px] font-bold capitalize transition-colors border truncate ${config.shape === s ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50'}`}
                                title={s}
                            >
                                {s === 'text' ? 'TEXT (A-Z)' : s.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Text Input - Only visible when shape is 'text' */}
                {config.shape === 'text' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                         <label className="flex justify-between text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">
                            Enter Text
                        </label>
                        <input 
                            type="text"
                            value={config.text || ''}
                            onChange={(e) => setConfig(p => ({ ...p, text: e.target.value.toUpperCase() }))}
                            maxLength={10}
                            placeholder="TYPE HERE..."
                            className="w-full bg-white/10 border border-purple-500 rounded-lg p-2 text-center text-white font-bold tracking-widest focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                )}

                <div>
                    <label className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Color <span className="text-white">{config.color}</span>
                    </label>
                    <input 
                        type="color" 
                        value={config.color}
                        onChange={(e) => {
                            setConfig(p => ({ ...p, color: e.target.value }));
                            setIsRandomColor(false); // Disable random color if manually changed
                        }}
                        className="w-full h-10 rounded cursor-pointer bg-transparent border border-white/20 p-1"
                    />
                </div>

                <div>
                    <label className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Count <span className="text-white">{config.particleCount}</span>
                    </label>
                    <input 
                        type="range" 
                        min="1000" 
                        max="20000" 
                        step="1000"
                        value={config.particleCount}
                        onChange={(e) => setConfig(p => ({ ...p, particleCount: Number(e.target.value) }))}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                    />
                </div>

                <div>
                    <label className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Speed <span className="text-white">{config.speed.toFixed(1)}</span>
                    </label>
                    <input 
                        type="range" 
                        min="0.1" 
                        max="3" 
                        step="0.1"
                        value={config.speed}
                        onChange={(e) => setConfig(p => ({ ...p, speed: Number(e.target.value) }))}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                    />
                </div>

                <div>
                    <label className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Noise / Chaos <span className="text-white">{config.noiseStrength.toFixed(1)}</span>
                    </label>
                    <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        step="0.1"
                        value={config.noiseStrength}
                        onChange={(e) => setConfig(p => ({ ...p, noiseStrength: Number(e.target.value) }))}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                    />
                </div>
                 <div>
                    <label className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Size <span className="text-white">{config.size.toFixed(2)}</span>
                    </label>
                    <input 
                        type="range" 
                        min="0.01" 
                        max="0.2" 
                        step="0.01"
                        value={config.size}
                        onChange={(e) => setConfig(p => ({ ...p, size: Number(e.target.value) }))}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                    />
                </div>
            </div>
        </div>
    </div>
  );
};

export default ControlPanel;
