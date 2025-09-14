import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { PRESETS, OBJECT_SHAPES, FONTS } from '../constants';
import { GlassPanel } from './ui/GlassPanel';
import { SiliconeButton } from './ui/SiliconeButton';
import { CustomSlider, CustomSelect, CustomTextInput } from './ui/CustomControls';
import { AppState, EngravingFace } from '../types';
import { Layers, Gem, Zap, Droplets, Award, Download, Trash2 } from 'lucide-react';

type Panel = 'Object' | 'Material' | 'Laser' | 'Caustics' | 'Presets';

const ControlPanel: React.FC = () => {
  const [activePanel, setActivePanel] = useState<Panel>('Laser');

  const handleExport = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'zen-engraver.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[380px] text-sm">
      <GlassPanel>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold tracking-tight">Controls</h2>
            <div className="flex space-x-1">
              <IconButton active={activePanel === 'Object'} onClick={() => setActivePanel('Object')}><Layers size={16} /></IconButton>
              <IconButton active={activePanel === 'Material'} onClick={() => setActivePanel('Material')}><Gem size={16} /></IconButton>
              <IconButton active={activePanel === 'Laser'} onClick={() => setActivePanel('Laser')}><Zap size={16} /></IconButton>
              <IconButton active={activePanel === 'Caustics'} onClick={() => setActivePanel('Caustics')}><Droplets size={16} /></IconButton>
              <IconButton active={activePanel === 'Presets'} onClick={() => setActivePanel('Presets')}><Award size={16} /></IconButton>
            </div>
          </div>
          
          <div className="max-h-[50vh] overflow-y-auto pr-2">
            {activePanel === 'Object' && <ObjectPanel />}
            {activePanel === 'Material' && <MaterialPanel />}
            {activePanel === 'Laser' && <LaserPanel />}
            {activePanel === 'Caustics' && <CausticsPanel />}
            {activePanel === 'Presets' && <PresetsPanel />}
          </div>


          <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
            <SiliconeButton onClick={handleExport} className="w-full"><Download size={16}/> Export</SiliconeButton>
            <SiliconeButton onClick={() => useStore.getState().actions.clearEngraving()} className="w-full bg-amber-500/80 hover:bg-amber-500/90"><Trash2 size={16}/> Clear</SiliconeButton>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};

const IconButton: React.FC<{ children: React.ReactNode; active: boolean; onClick: () => void }> = ({ children, active, onClick }) => (
    <button onClick={onClick} className={`p-2 rounded-lg transition-colors ${active ? 'bg-white/20 text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-400'}`}>
        {children}
    </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`space-y-3 ${className}`}>
    <h3 className="font-semibold text-zinc-700">{title}</h3>
    {children}
  </div>
);

const ObjectPanel: React.FC = () => {
    const { object, actions } = useStore();
    return <Section title="Object Controls">
        <CustomSelect label="Shape" value={object.shape} options={OBJECT_SHAPES} onChange={(v) => actions.set(s => ({...s, object: {...s.object, shape: v as any}}))} />
        <CustomSlider label="Scale" value={object.scale} min={0.5} max={2} step={0.01} onChange={(v) => actions.set(s => ({...s, object: {...s.object, scale: v}}))} />
        <label className="flex items-center gap-2 text-zinc-800"><input type="checkbox" checked={object.autoRotate} onChange={(e) => actions.set(s => ({...s, object: {...s.object, autoRotate: e.target.checked}}))} /> Auto-rotate</label>
    </Section>
}

const MaterialPanel: React.FC = () => {
    const { material, actions } = useStore();
    return <Section title="Material Properties">
        <CustomSlider label="IOR" value={material.ior} min={1} max={2.4} step={0.01} onChange={(v) => actions.set(s => ({...s, material: {...s.material, ior: v}}))} />
        <CustomSlider label="Roughness" value={material.roughness} min={0} max={1} step={0.01} onChange={(v) => actions.set(s => ({...s, material: {...s.material, roughness: v}}))} />
        <CustomSlider label="Thickness" value={material.thickness} min={0} max={5} step={0.01} onChange={(v) => actions.set(s => ({...s, material: {...s.material, thickness: v}}))} />
        <CustomSlider label="Dispersion" value={material.chromaticAberration} min={0} max={1} step={0.01} onChange={(v) => actions.set(s => ({...s, material: {...s.material, chromaticAberration: v}}))} />
    </Section>
}

const LaserPanel: React.FC = () => {
    const { laser, object, actions } = useStore();

    const CUBE_FACES: EngravingFace[] = ['Front', 'Back', 'Top', 'Bottom', 'Left', 'Right'];
    const PANEL_FACES: EngravingFace[] = ['Front', 'Back'];
    
    const availableFaces = object.shape === 'Cube' ? CUBE_FACES : object.shape === 'Panel' ? PANEL_FACES : [];

    const handleFaceToggle = (face: EngravingFace) => {
        actions.set(s => {
            const currentFaces = s.laser.engravingFaces;
            const newFaces = currentFaces.includes(face)
                ? currentFaces.filter(f => f !== face)
                : [...currentFaces, face];
            return { ...s, laser: { ...s.laser, engravingFaces: newFaces } };
        });
    };

    return <>
        <Section title="Laser Engraving">
            <CustomTextInput label="Signature / Phrase" value={laser.text} onChange={(v) => actions.set(s => ({...s, laser: {...s.laser, text: v}}))} />
            <CustomSelect label="Font Style" value={laser.font} options={FONTS} onChange={(v) => actions.set(s => ({...s, laser: {...s.laser, font: v}}))} />
            <CustomSlider label="Engraving Depth" value={laser.depth} min={0.1} max={1} step={0.01} onChange={(v) => actions.set(s => ({...s, laser: {...s.laser, depth: v}}))} />
            <div className="flex items-center justify-between">
                <label className="text-zinc-600 font-medium">Color</label>
                <input 
                    type="color" 
                    value={laser.engravingColor} 
                    onChange={(e) => actions.set(s => ({...s, laser: {...s.laser, engravingColor: e.target.value}}))}
                    className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-transparent"
                />
            </div>
            <CustomSelect 
                label="Style" 
                value={laser.engravingStyle} 
                options={['Glow', 'Matte']} 
                onChange={(v) => actions.set(s => ({...s, laser: {...s.laser, engravingStyle: v as any}}))} 
            />
        </Section>
        
        {availableFaces.length > 0 && (
            <Section title="Engraving Faces" className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-3 gap-2">
                    {availableFaces.map(face => (
                        <button
                            key={face}
                            onClick={() => handleFaceToggle(face)}
                            className={`p-2 rounded-lg text-xs text-center transition-colors ${
                                laser.engravingFaces.includes(face)
                                    ? 'bg-zinc-800 text-white font-semibold'
                                    : 'bg-white/20 hover:bg-white/40 text-zinc-700'
                            }`}
                        >
                            {face}
                        </button>
                    ))}
                </div>
            </Section>
        )}

        <SiliconeButton onClick={actions.startEngraving} disabled={laser.isEngraving || laser.text.trim().length === 0} className="w-full mt-4">
            {laser.isEngraving ? 'Engraving...' : 'Start Engraving'}
        </SiliconeButton>
    </>
}

const CausticsPanel: React.FC = () => {
    const { caustics, actions } = useStore();
    return <Section title="Caustics & Lighting">
        <label className="flex items-center gap-2 text-zinc-800"><input type="checkbox" checked={caustics.enabled} onChange={(e) => actions.set(s => ({...s, caustics: {...s.caustics, enabled: e.target.checked}}))} /> Enable Caustics</label>
        {caustics.enabled && <>
            <CustomSlider label="Intensity" value={caustics.intensity} min={0} max={1} step={0.01} onChange={(v) => actions.set(s => ({...s, caustics: {...s.caustics, intensity: v}}))} />
            <div className="flex items-center justify-between">
                <label className="text-zinc-600 font-medium">Color</label>
                <input type="color" value={caustics.color} onChange={(e) => actions.set(s => ({...s, caustics: {...s.caustics, color: e.target.value}}))} />
            </div>
        </>}
    </Section>
}

const PresetsPanel: React.FC = () => {
    const { actions } = useStore();
    return <Section title="Presets">
        <div className="grid grid-cols-2 gap-2">
            {PRESETS.map(p => <button key={p.name} onClick={() => actions.applyPreset(p)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left text-zinc-800">{p.name}</button>)}
        </div>
    </Section>
}

export default ControlPanel;
