
export type ShapeType = 
  | 'sphere' | 'cube' | 'torus' | 'spiral' | 'grid'
  | 'galaxy' | 'heart' | 'dna' | 'car' | 'bear'
  | 'solar_system' | 'comet' | 'ocean' | 'tree' 
  | 'diamond' | 'dollar' | 'euro' | 'bitcoin' | 'yen' | 'text';

export interface ParticleConfig {
  particleCount: number;
  color: string;
  shape: ShapeType;
  speed: number;
  noiseStrength: number;
  size: number;
  text?: string; // For 'text' shape
}

export interface AIState {
  isLoading: boolean;
  error: string | null;
}
