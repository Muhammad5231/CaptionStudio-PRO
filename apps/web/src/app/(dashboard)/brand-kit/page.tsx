'use client';

import React, { useState } from 'react';
import { Plus, Palette, Type, Image as ImageIcon, Save, Check, Trash2 } from 'lucide-react';
import { Button, Input, Card } from '@captionstudio/ui';

export default function BrandKitPage() {
  const [primaryColor, setPrimaryColor] = useState('#635BFF');
  const [secondaryColor, setSecondaryColor] = useState('#09090B');
  const [accentColor, setAccentColor] = useState('#10B981');
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');
  const [isSaved, setIsSaved] = useState(false);

  const presets = [
    { id: 'p-1', name: 'Standard Viral Reel', font: 'Montserrat', color: '#FFFFFF', highlight: '#FACC15' },
    { id: 'p-2', name: 'Corporate Keynote Subtitle', font: 'Inter', color: '#F8FAFC', highlight: '#635BFF' },
    { id: 'p-3', name: 'Podcast Emerald Glow', font: 'Plus Jakarta Sans', color: '#FFFFFF', highlight: '#10B981' },
  ];

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">Brand Kit</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            Define global typography, color palettes, watermark logos, and default animation presets for your team.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          leftIcon={isSaved ? <Check className="h-4 w-4 text-emerald-300" /> : <Save className="h-4 w-4" />}
        >
          {isSaved ? 'Changes Saved!' : 'Save Brand Kit'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Brand Colors & Watermark */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <Palette className="h-4 w-4 text-[#635BFF]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Brand Color Palette</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                  Primary Accent Color (Highlight & Buttons)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-12 rounded-lg border border-slate-300 dark:border-zinc-700 cursor-pointer p-0.5 bg-transparent"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono w-32"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                  Secondary Dark Neutral
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 w-12 rounded-lg border border-slate-300 dark:border-zinc-700 cursor-pointer p-0.5 bg-transparent"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono w-32"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                  Karaoke Active Word Glow Accent
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 w-12 rounded-lg border border-slate-300 dark:border-zinc-700 cursor-pointer p-0.5 bg-transparent"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono w-32"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Watermark & Logo Overlay */}
          <Card className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <ImageIcon className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Studio Watermark & Logo Overlay</h3>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-800 p-6 text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Upload Transparent PNG Logo</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Recommended resolution: 512x512 with alpha channel</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                  Default Screen Placement
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setWatermarkPosition(pos)}
                      className={`p-2.5 rounded-lg border text-center font-medium capitalize transition-all ${
                        watermarkPosition === pos
                          ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF]'
                          : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      {pos.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Custom Presets */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Saved Typography Presets</h3>
              </div>
              <button className="inline-flex items-center gap-1 text-xs font-semibold text-[#635BFF] hover:underline">
                <Plus className="h-3.5 w-3.5" />
                <span>New Preset</span>
              </button>
            </div>

            <div className="space-y-3">
              {presets.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100">{p.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      Font: <span className="font-semibold text-slate-600 dark:text-zinc-300">{p.font}</span> • Highlight:{' '}
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full align-middle ml-1"
                        style={{ backgroundColor: p.highlight }}
                      />
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-[11px] h-7 px-2">
                      Apply Default
                    </Button>
                    <button className="p-1 text-slate-400 hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

