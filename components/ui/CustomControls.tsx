
import React from 'react';

interface ControlProps {
  label: string;
}

export const CustomSlider: React.FC<ControlProps & { value: number; min: number; max: number; step: number; onChange: (value: number) => void; }> = ({ label, value, min, max, step, onChange }) => (
  <div className="flex flex-col">
    <div className="flex justify-between items-baseline mb-1">
      <label className="text-zinc-600 font-medium">{label}</label>
      <span className="text-zinc-800 font-mono text-xs px-2 py-0.5 bg-white/20 rounded">{value.toFixed(2)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-zinc-800"
    />
  </div>
);


export const CustomSelect: React.FC<ControlProps & { value: string; options: readonly string[]; onChange: (value: string) => void; }> = ({ label, value, options, onChange }) => (
  <div className="flex flex-col">
    <label className="text-zinc-600 font-medium mb-1">{label}</label>
    <div className="relative prismatic-border rounded-lg">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white/30 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-zinc-500"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  </div>
);

export const CustomTextInput: React.FC<ControlProps & { value: string; onChange: (value: string) => void; }> = ({ label, value, onChange }) => (
  <div className="flex flex-col">
    <label className="text-zinc-600 font-medium mb-1">{label}</label>
    <div className="relative prismatic-border rounded-lg">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white/30 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-zinc-500"
      />
    </div>
  </div>
);
