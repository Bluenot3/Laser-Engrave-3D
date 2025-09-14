import { create } from 'zustand';
import { AppState, Preset } from '../types';

export const useStore = create<AppState>((set, get) => ({
  object: {
    shape: 'Cube',
    scale: 1,
    autoRotate: true,
  },
  material: {
    ior: 1.3,
    thickness: 1.5,
    roughness: 0.05,
    transmission: 1.0,
    chromaticAberration: 0.05,
    anisotropicBlur: 0.1,
    distortion: 0.1,
    distortionScale: 0.2,
    temporalDistortion: 0.2,
  },
  laser: {
    text: 'ZEN AI',
    font: 'Sans-serif',
    isEngraving: false,
    speed: 0.5,
    beamWidth: 0.01,
    depth: 0.5,
    passCount: 1,
    engravingNonce: 0,
    engravingColor: '#00ffff',
    engravingStyle: 'Glow',
    engravingFaces: ['Front'],
  },
  caustics: {
    enabled: true,
    intensity: 0.15,
    color: '#ffffff',
    lightSource: [5, 5, -5],
  },
  actions: {
    set: (fn) => set(fn),
    startEngraving: () => {
      const { laser } = get();
      if (laser.text.trim().length === 0) return;
      set({
        laser: { 
          ...laser, 
          isEngraving: true, 
          engravingNonce: get().laser.engravingNonce + 1 
        }
      });
    },
    stopEngraving: () => set((state) => ({ laser: { ...state.laser, isEngraving: false } })),
    clearEngraving: () => { 
        set((state) => ({ 
            laser: { 
                ...state.laser, 
                isEngraving: false, 
                text: '', // Actually clear the text
                engravingNonce: state.laser.engravingNonce + 1 
            } 
        }));
    },
    applyPreset: (preset: Preset) => {
      set((state) => ({
        object: { ...state.object, ...preset.config.object },
        material: { ...state.material, ...preset.config.material },
        laser: { ...state.laser, ...preset.config.laser },
        caustics: { ...state.caustics, ...preset.config.caustics },
      }));
    }
  },
}));
