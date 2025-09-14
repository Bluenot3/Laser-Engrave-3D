import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, useFBO } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../hooks/useStore';
import { EngravingFace } from '../types';

const FONT_MAP: { [key: string]: string } = {
  'Cursive': '256px Great Vibes, cursive',
  'Sans-serif': 'bold 256px Inter, sans-serif',
  'Serif': 'italic 256px serif',
};
const getFontString = (font: string) => FONT_MAP[font] || FONT_MAP['Sans-serif'];

const emitterPosition = new THREE.Vector3(0, 5, 5);
const upVector = new THREE.Vector3(0, 1, 0);

// UV mapping for a standard THREE.BoxGeometry
const CUBE_FACE_UVS: Record<EngravingFace, { x: number, y: number, rotation: number, normal: THREE.Vector3 }> = {
  'Right':  { x: 0, y: 0.25, rotation: 0, normal: new THREE.Vector3(1, 0, 0) },  // +x
  'Left':   { x: 0.5, y: 0.25, rotation: 0, normal: new THREE.Vector3(-1, 0, 0) }, // -x
  'Top':    { x: 0.25, y: 0.5, rotation: 0, normal: new THREE.Vector3(0, 1, 0) },  // +y
  'Bottom': { x: 0.25, y: 0, rotation: 0, normal: new THREE.Vector3(0, -1, 0) }, // -y
  'Front':  { x: 0.25, y: 0.25, rotation: 0, normal: new THREE.Vector3(0, 0, 1) },  // +z
  'Back':   { x: 0.75, y: 0.25, rotation: 0, normal: new THREE.Vector3(0, 0, -1) }, // -z
};

const PANEL_FACE_UVS: Record<EngravingFace, { x: number, y: number, rotation: number, normal: THREE.Vector3 }> = {
    'Front': { x: 0.25, y: 0.25, rotation: 0, normal: new THREE.Vector3(0, 0, 1) },
    'Back':  { x: 0.75, y: 0.25, rotation: 0, normal: new THREE.Vector3(0, 0, -1) },
    'Left': {x:0,y:0, rotation:0, normal: new THREE.Vector3(0,0,0)}, // unused
    'Right': {x:0,y:0, rotation:0, normal: new THREE.Vector3(0,0,0)}, // unused
    'Top': {x:0,y:0, rotation:0, normal: new THREE.Vector3(0,0,0)}, // unused
    'Bottom': {x:0,y:0, rotation:0, normal: new THREE.Vector3(0,0,0)}, // unused
};


const Sparks = ({ position, isEngraving }: { position: THREE.Vector3; isEngraving: boolean }) => {
  const ref = useRef<THREE.Points>(null!);
  const velocities = useMemo(() => Array.from({ length: 100 }, () => new THREE.Vector3()), []);

  useFrame((state, delta) => {
    if (!ref.current || !isEngraving) return;
    const positions = ref.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < 100; i++) {
        velocities[i].y -= 9.8 * delta * 0.1;
        positions[i * 3 + 0] += velocities[i].x * delta;
        positions[i * 3 + 1] += velocities[i].y * delta;
        positions[i * 3 + 2] += velocities[i].z * delta;

        if (positions[i * 3 + 1] < -2) {
             if (Math.random() > 0.5) {
                positions[i * 3 + 0] = position.x;
                positions[i * 3 + 1] = position.y;
                positions[i * 3 + 2] = position.z;
                velocities[i].set((Math.random() - 0.5) * 2, Math.random() * 2.5, (Math.random() - 0.5) * 2);
            }
        }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={100}
          array={new Float32Array(100 * 3)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial transparent color="#ffc080" size={0.015} sizeAttenuation={true} depthWrite={false} />
    </points>
  );
};


const LaserBeam = ({ target, visible }: { target: THREE.Vector3; visible: boolean }) => {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    if (!ref.current || !visible) {
      if(ref.current) ref.current.scale.y = 0;
      return;
    }
    const distance = emitterPosition.distanceTo(target);
    ref.current.position.copy(emitterPosition).add(target).divideScalar(2);
    ref.current.scale.y = distance;
    const orientation = new THREE.Matrix4();
    orientation.lookAt(emitterPosition, target, upVector);
    ref.current.quaternion.setFromRotationMatrix(orientation);
  });
  
  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[0.01, 0.01, 1, 8]} />
      <meshBasicMaterial color="cyan" transparent opacity={0.5} depthWrite={false} />
    </mesh>
  );
};

const GlassObject = () => {
  const { object, material, laser, actions } = useStore();
  const meshRef = useRef<THREE.Mesh>(null!);
  const laserMarkerRef = useRef<THREE.Mesh>(null!);
  const [laserTarget, setLaserTarget] = useState(() => new THREE.Vector3());
  
  const progressRef = useRef(0);
  const textureSize = 4096;
  
  // Two canvases: one for the final "baked" texture, one for the animation
  const { finalCtx, animCtx, texture } = useMemo(() => {
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = textureSize;
    finalCanvas.height = textureSize;
    const finalContext = finalCanvas.getContext('2d')!;

    const animCanvas = document.createElement('canvas');
    animCanvas.width = textureSize;
    animCanvas.height = textureSize;
    const animContext = animCanvas.getContext('2d')!;

    const tex = new THREE.CanvasTexture(animCanvas);
    tex.needsUpdate = true;
    return { finalCtx: finalContext, animCtx: animContext, texture: tex };
  }, []);

  const geometry = useMemo(() => {
    switch (object.shape) {
      case 'Panel': return new THREE.BoxGeometry(3, 4, 0.2);
      case 'Cube': return new THREE.BoxGeometry(2.5, 2.5, 2.5);
      case 'Sphere': return new THREE.SphereGeometry(1.5, 64, 64);
      case 'Torus': return new THREE.TorusGeometry(1.5, 0.5, 32, 100);
      case 'Prism': return new THREE.CylinderGeometry(1.5, 1.5, 2.5, 3);
    }
  }, [object.shape]);

  const FACE_UVS = object.shape === 'Panel' ? PANEL_FACE_UVS : CUBE_FACE_UVS;

  // Clear textures on nonce change
  useEffect(() => {
    finalCtx.clearRect(0, 0, textureSize, textureSize);
    animCtx.clearRect(0, 0, textureSize, textureSize);
    texture.needsUpdate = true;
    if(laserMarkerRef.current) laserMarkerRef.current.visible = false;

    if (laser.text.length === 0) { // Special case for "Clear" button
        progressRef.current = 0;
    }
  }, [laser.engravingNonce, object.shape]);

  useEffect(() => {
    if (laser.isEngraving) {
      progressRef.current = 0;
    } else {
       if (laserMarkerRef.current) laserMarkerRef.current.visible = false;
    }
  }, [laser.isEngraving]);

  const drawTextOnCanvas = (ctx: CanvasRenderingContext2D, textToDraw: string) => {
    ctx.clearRect(0, 0, textureSize, textureSize);
    ctx.font = getFontString(laser.font);
    ctx.fillStyle = laser.engravingColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const faceSize = textureSize / 4; // UV layout is roughly 4x4 grid

    laser.engravingFaces.forEach(face => {
        if (!FACE_UVS[face] || !geometry.parameters) return;

        const faceUV = FACE_UVS[face];
        const canvasX = (faceUV.x + 0.125) * textureSize; // center of the face tile
        const canvasY = (1.0 - (faceUV.y + 0.125)) * textureSize; // y is inverted
        
        ctx.save();
        ctx.translate(canvasX, canvasY);
        ctx.rotate(faceUV.rotation * Math.PI / 180);
        ctx.fillText(textToDraw, 0, 0);
        ctx.restore();
    });
  }

  useFrame((state, delta) => {
    if (object.autoRotate && !laser.isEngraving) {
      meshRef.current.rotation.y += delta * 0.1;
    }
    
    if (laser.isEngraving) {
      const duration = laser.text.length * 0.15 / laser.speed;
      progressRef.current = Math.min(1, progressRef.current + delta / duration);
      
      const charIndex = Math.floor(progressRef.current * laser.text.length);
      const textToDraw = laser.text.substring(0, charIndex);
      
      // Draw animation frame
      drawTextOnCanvas(animCtx, textToDraw);
      texture.needsUpdate = true;

      // Position laser marker
      if (laserMarkerRef.current && laser.engravingFaces.length > 0) {
          laserMarkerRef.current.visible = true;
          const currentFaceName = laser.engravingFaces[0]; // For now, track on the first selected face
          const face = FACE_UVS[currentFaceName];
          if(face) {
              const textWidth = animCtx.measureText(laser.text).width;
              const currentWidth = animCtx.measureText(textToDraw).width;
              
              const progressX = (currentWidth / textWidth) - 0.5;
              
              const params = geometry.parameters as any;
              const scale = new THREE.Vector3(params.width/2 || params.radius || 1.25, params.height/2 || params.radius || 1.25, params.depth/2 || params.radius || 1.25);

              // Simple tangent/bitangent from normal
              const tangent = new THREE.Vector3().crossVectors(face.normal, upVector).normalize();
              if (tangent.length() === 0) tangent.set(1,0,0); // Handle top/bottom
              const bitangent = new THREE.Vector3().crossVectors(face.normal, tangent).normalize();

              const surfacePos = new THREE.Vector3().copy(face.normal)
                  .add(tangent.multiplyScalar(progressX * 0.7)) // 0.7 is fudge factor
                  .multiply(scale);

              laserMarkerRef.current.position.copy(surfacePos);
              setLaserTarget(laserMarkerRef.current.getWorldPosition(new THREE.Vector3()));
          }
      }
      
      // Finish engraving
      if (progressRef.current >= 1) {
        drawTextOnCanvas(finalCtx, laser.text); // Bake final text
        animCtx.drawImage(finalCtx.canvas, 0, 0); // Ensure final frame is perfect
        texture.needsUpdate = true;
        actions.stopEngraving();
      }

    } else {
        // When not engraving, make sure the texture shows the final baked result
        animCtx.clearRect(0, 0, textureSize, textureSize);
        animCtx.drawImage(finalCtx.canvas, 0, 0);
        texture.needsUpdate = true;
    }
  });
  
  return (
    <group scale={object.scale}>
      <mesh ref={meshRef} geometry={geometry} castShadow>
        <MeshTransmissionMaterial
          {...material}
          roughnessMap={texture}
          displacementMap={texture}
          displacementScale={laser.depth * 0.05}
          metalness={laser.engravingStyle === 'Matte' ? 0.5 : 0.2}
          metalnessMap={texture}
          emissive={laser.engravingColor}
          emissiveMap={texture}
          emissiveIntensity={laser.engravingStyle === 'Glow' ? 2 : 0}
          background={new THREE.Color('#ffffff')}
        />
      </mesh>
      
      <mesh ref={laserMarkerRef} visible={false}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color="cyan" toneMapped={false} />
        <pointLight color="cyan" intensity={10} distance={1.5} decay={2} />
      </mesh>
      
      <LaserBeam target={laserTarget} visible={laser.isEngraving && progressRef.current < 1} />
      <Sparks position={laserTarget} isEngraving={laser.isEngraving && progressRef.current < 1} />
    </group>
  );
};

export default GlassObject;
