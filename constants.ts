

import type { Preset, ObjectShape } from './types';

export const OBJECT_SHAPES: ObjectShape[] = ['Panel', 'Cube', 'Sphere', 'Torus', 'Prism'];

export const FONTS = ['Cursive', 'Sans-serif', 'Serif'];

export const PRESETS: Preset[] = [
  {
    name: "Studio Minimal",
    config: {
      material: {
        ior: 1.2,
        roughness: 0.05,
        thickness: 1.0,
        chromaticAberration: 0.02,
      },
      caustics: { enabled: true, intensity: 0.1 },
    },
  },
  {
    name: "Prism Burst",
    config: {
      material: {
        ior: 1.8,
        roughness: 0.0,
        thickness: 0.5,
        chromaticAberration: 0.5,
        distortion: 0.2,
      },
      caustics: { enabled: true, intensity: 0.5, color: '#8A2BE2' },
    },
  },
  {
    name: "Deep Etch",
    config: {
      object: { shape: 'Cube' },
      material: {
        ior: 1.52,
        roughness: 0.2,
        thickness: 2.0,
        chromaticAberration: 0.01,
      },
      laser: { depth: 0.9, passCount: 3 },
    },
  },
    {
    name: "Ghost Glass",
    config: {
      material: {
        ior: 1.0,
        roughness: 0.7,
        thickness: 1.5,
        transmission: 0.9,
        chromaticAberration: 0.0,
        distortion: 0.05,
      },
      caustics: { enabled: false },
    },
  },
];