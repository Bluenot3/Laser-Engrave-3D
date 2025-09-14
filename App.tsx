
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';
import ControlPanel from './components/ControlPanel';

const App: React.FC = () => {
  return (
    <main className="w-screen h-screen bg-white text-zinc-900 relative">
      <Suspense fallback={<Loader />}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 1.5, 8], fov: 50 }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          className="w-full h-full"
        >
          <Scene />
        </Canvas>
      </Suspense>
      <ControlPanel />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <h1 className="text-2xl font-bold tracking-tighter text-zinc-800">
          ZEN<span className="font-light">Engraver</span>
        </h1>
      </div>
    </main>
  );
};

const Loader: React.FC = () => (
  <div className="absolute inset-0 z-20 flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin"></div>
      <p className="mt-4 text-zinc-600">Loading 3D assets...</p>
    </div>
  </div>
);

export default App;
