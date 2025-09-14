// Fix: Define ObjectShape in this file to break a circular dependency with constants.ts.
export type ObjectShape = 'Panel' | 'Cube' | 'Sphere' | 'Torus' | 'Prism';

export type EngravingFace = 'Front' | 'Back' | 'Top' | 'Bottom' | 'Left' | 'Right';

export interface AppState {
  object: {
    shape: ObjectShape;
    scale: number;
    autoRotate: boolean;
  };
  material: {
    ior: number;
    thickness: number;
    roughness: number;
    transmission: number;
    chromaticAberration: number;
    anisotropicBlur: number;
    distortion: number;
    distortionScale: number;
    temporalDistortion: number;
  };
  laser: {
    text: string;
    font: string;
    isEngraving: boolean;
    speed: number;
    beamWidth: number;
    depth: number;
    passCount: number;
    engravingNonce: number;
    engravingColor: string;
    engravingStyle: 'Glow' | 'Matte';
    engravingFaces: EngravingFace[];
  };
  caustics: {
    enabled: boolean;
    intensity: number;
    color: string;
    lightSource: [number, number, number];
  };
  actions: {
    set: (fn: (state: AppState) => AppState | Partial<AppState>) => void;
    startEngraving: () => void;
    stopEngraving: () => void;
    clearEngraving: () => void;
    applyPreset: (preset: Preset) => void;
  };
}

export interface Preset {
  name: string;
  config: {
    object?: Partial<AppState['object']>;
    material?: Partial<AppState['material']>;
    laser?: Partial<AppState['laser']>;
    caustics?: Partial<AppState['caustics']>;
  };
}
