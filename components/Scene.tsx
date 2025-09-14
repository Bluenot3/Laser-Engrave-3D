import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, Caustics } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import GlassObject from './GlassObject';
import { useStore } from '../hooks/useStore';
import * as THREE from 'three';

const Scene = () => {
  const { caustics } = useStore();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lightSourceRef = useRef<THREE.Mesh>(null!);

  return (
    <>
      <color attach="background" args={['#ffffff']} />
      <OrbitControls makeDefault dampingFactor={0.2} minDistance={2} maxDistance={15} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 7]} intensity={1} castShadow />

      <Environment preset="city" />

      <Caustics
        backside
        // FIX: Added required `causticsOnly` prop to fix the type error.
        causticsOnly={false}
        color={caustics.enabled ? caustics.color : '#ffffff'}
        lightSource={lightSourceRef}
        worldRadius={0.3}
        ior={1.2}
        backsideIOR={1.2}
        intensity={caustics.enabled ? caustics.intensity : 0}
      >
        <mesh ref={lightSourceRef} position={[caustics.lightSource[0], caustics.lightSource[1], caustics.lightSource[2]]}>
          <sphereGeometry args={[0.1]} />
          <meshBasicMaterial color="white" />
        </mesh>
      </Caustics>

      <group>
        <GlassObject />
      </group>

      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.5}
        scale={20}
        blur={1}
        far={10}
        resolution={256}
        color="#000000"
      />

      <EffectComposer>
        <Bloom luminanceThreshold={1} intensity={1.5} mipmapBlur />
      </EffectComposer>
    </>
  );
};

export default Scene;
