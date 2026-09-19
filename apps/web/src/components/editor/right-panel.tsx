'use client';

import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Type,
  Layout,
  Move,
  Check,
  Crown,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import {
  APPROVED_FONTS,
  PRODUCTION_TEMPLATES,
  ProductionTemplate,
  applyTemplate,
} from '@captionstudio/captions';

type Tab = 'templates' | 'style' | 'animation' | 'layout';

export function EditorRightPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('templates');
  const [templateFilter, setTemplateFilter] = useState<string>('ALL');

  const {
    style,
    updateStyleField,
    setStyle,
    showSafeAreas,
    setShowSafeAreas,
    aspectRatio,
  } = useEditorStore();

  const categories = [
    'ALL',
    'Trending',
    'Minimal',
    'Bold',
    'Podcast',
    'Gaming',
    'Shorts',
    'Reels',
    'TikTok',
    'Cinematic',
    'Karaoke',
  ];

  const filteredTemplates = PRODUCTION_TEMPLATES.filter((t) =>
    templateFilter === 'ALL' ? true : t.category === templateFilter
  );

  const handleApplyTemplate = (tpl: ProductionTemplate) => {
    const updated = applyTemplate(tpl.id, { position: style.position, layout: style.layout });
    setStyle(updated);
  };

  return (
    <aside className="w-80 border-l border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shrink-0 select-none overflow-hidden h-full">
      {/* Tab Navigation */}
      <div className="grid grid-cols-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 p-1 gap-0.5 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex flex-col items-center gap-1 py-2 px-1 rounded-md transition-all ${
            activeTab === 'templates'
              ? 'bg-white dark:bg-zinc-800 text-[#635BFF] dark:text-[#8179ff] shadow-sm'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-[11px]">Templates</span>
        </button>

        <button
          onClick={() => setActiveTab('style')}
          className={`flex flex-col items-center gap-1 py-2 px-1 rounded-md transition-all ${
            activeTab === 'style'
              ? 'bg-white dark:bg-zinc-800 text-[#635BFF] dark:text-[#8179ff] shadow-sm'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Type className="h-4 w-4" />
          <span className="text-[11px]">Style</span>
        </button>

        <button
          onClick={() => setActiveTab('animation')}
          className={`flex flex-col items-center gap-1 py-2 px-1 rounded-md transition-all ${
            activeTab === 'animation'
              ? 'bg-white dark:bg-zinc-800 text-[#635BFF] dark:text-[#8179ff] shadow-sm'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Palette className="h-4 w-4" />
          <span className="text-[11px]">Motion</span>
        </button>

        <button
          onClick={() => setActiveTab('layout')}
          className={`flex flex-col items-center gap-1 py-2 px-1 rounded-md transition-all ${
            activeTab === 'layout'
              ? 'bg-white dark:bg-zinc-800 text-[#635BFF] dark:text-[#8179ff] shadow-sm'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Move className="h-4 w-4" />
          <span className="text-[11px]">Position</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* TAB 1: TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-[11px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTemplateFilter(cat)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                    templateFilter === cat
                      ? 'bg-[#635BFF] text-white font-semibold'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Template Cards Grid */}
            <div className="grid grid-cols-1 gap-3">
              {filteredTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleApplyTemplate(tpl)}
                  className="group relative cursor-pointer rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 p-3 hover:border-[#635BFF] dark:hover:border-[#635BFF] hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                        {tpl.name}
                        {tpl.isPremium && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            <Crown className="h-2.5 w-2.5" /> PRO
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-1">
                        {tpl.category} &bull; {tpl.description}
                      </p>
                    </div>

                    {/* Preview Color Swatches */}
                    <div className="flex items-center -space-x-1">
                      {tpl.previewColors.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-3.5 h-3.5 rounded-full border border-white dark:border-zinc-900 shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Preview Banner Box */}
                  <div className="rounded-lg bg-black p-3 text-center overflow-hidden flex items-center justify-center min-h-[50px] shadow-inner">
                    <span
                      style={{
                        fontFamily: tpl.styleConfig.typography.fontFamily,
                        fontSize: '13px',
                        fontWeight: tpl.styleConfig.typography.fontWeight,
                        color: tpl.styleConfig.fill.color,
                        textTransform: tpl.styleConfig.typography.textTransform as any,
                        letterSpacing: `${tpl.styleConfig.typography.letterSpacing}px`,
                        textShadow: tpl.styleConfig.shadow.enabled
                          ? `0 2px 4px ${tpl.styleConfig.shadow.color}`
                          : 'none',
                        WebkitTextStroke: tpl.styleConfig.stroke.enabled
                          ? `${Math.max(1, Math.round(tpl.styleConfig.stroke.width / 3))}px ${tpl.styleConfig.stroke.color}`
                          : 'none',
                      }}
                    >
                      {tpl.previewText}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: STYLE */}
        {activeTab === 'style' && (
          <div className="space-y-5">
            {/* Font Family */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Font Family
              </label>
              <select
                value={style.typography.fontFamily}
                onChange={(e) =>
                  updateStyleField('typography', {
                    ...style.typography,
                    fontFamily: e.target.value,
                  })
                }
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
              >
                {APPROVED_FONTS.map((font) => (
                  <option key={font.name} value={font.name}>
                    {font.name} ({font.popularFor})
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size & Weight Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Size
                  </span>
                  <span className="font-mono text-slate-700 dark:text-zinc-300">
                    {style.typography.fontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="96"
                  value={style.typography.fontSize}
                  onChange={(e) =>
                    updateStyleField('typography', {
                      ...style.typography,
                      fontSize: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#635BFF]"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Weight
                </span>
                <select
                  value={style.typography.fontWeight}
                  onChange={(e) =>
                    updateStyleField('typography', {
                      ...style.typography,
                      fontWeight: Number(e.target.value),
                    })
                  }
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-slate-900 dark:text-zinc-100"
                >
                  <option value={400}>Regular (400)</option>
                  <option value={600}>Semi-Bold (600)</option>
                  <option value={700}>Bold (700)</option>
                  <option value={800}>Extra-Bold (800)</option>
                  <option value={900}>Black (900)</option>
                </select>
              </div>
            </div>

            {/* Fill Color */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Text Fill Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={style.fill.color}
                  onChange={(e) =>
                    updateStyleField('fill', {
                      ...style.fill,
                      color: e.target.value,
                    })
                  }
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 dark:border-zinc-800 bg-transparent p-0.5"
                />
                <input
                  type="text"
                  value={style.fill.color}
                  onChange={(e) =>
                    updateStyleField('fill', {
                      ...style.fill,
                      color: e.target.value,
                    })
                  }
                  className="flex-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 uppercase"
                />
              </div>
            </div>

            {/* Transform & Alignment */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Text Transform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['none', 'uppercase', 'lowercase'] as const).map((tt) => (
                  <button
                    key={tt}
                    onClick={() =>
                      updateStyleField('typography', {
                        ...style.typography,
                        textTransform: tt,
                      })
                    }
                    className={`py-1.5 text-xs rounded-lg border font-semibold capitalize transition-all ${
                      style.typography.textTransform === tt
                        ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF]'
                        : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {tt}
                  </button>
                ))}
              </div>
            </div>

            {/* Stroke / Outline */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={style.stroke.enabled}
                    onChange={(e) =>
                      updateStyleField('stroke', {
                        ...style.stroke,
                        enabled: e.target.checked,
                      })
                    }
                    className="rounded border-slate-300 text-[#635BFF] focus:ring-[#635BFF]"
                  />
                  Text Stroke Outline
                </label>
                {style.stroke.enabled && (
                  <span className="font-mono text-[10px] text-slate-400">
                    {style.stroke.width}px
                  </span>
                )}
              </div>

              {style.stroke.enabled && (
                <div className="space-y-2 pl-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style.stroke.color}
                      onChange={(e) =>
                        updateStyleField('stroke', {
                          ...style.stroke,
                          color: e.target.value,
                        })
                      }
                      className="w-7 h-7 rounded border border-slate-200 dark:border-zinc-800 p-0.5"
                    />
                    <input
                      type="text"
                      value={style.stroke.color}
                      onChange={(e) =>
                        updateStyleField('stroke', {
                          ...style.stroke,
                          color: e.target.value,
                        })
                      }
                      className="flex-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1"
                    />
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={style.stroke.width}
                    onChange={(e) =>
                      updateStyleField('stroke', {
                        ...style.stroke,
                        width: Number(e.target.value),
                      })
                    }
                    className="w-full accent-[#635BFF]"
                  />
                </div>
              )}
            </div>

            {/* Drop Shadow */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={style.shadow.enabled}
                    onChange={(e) =>
                      updateStyleField('shadow', {
                        ...style.shadow,
                        enabled: e.target.checked,
                      })
                    }
                    className="rounded border-slate-300 text-[#635BFF] focus:ring-[#635BFF]"
                  />
                  Drop Shadow
                </label>
              </div>

              {style.shadow.enabled && (
                <div className="space-y-2.5 pl-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 w-12">Color</span>
                    <input
                      type="color"
                      value={
                        style.shadow.color.startsWith('#')
                          ? style.shadow.color
                          : '#000000'
                      }
                      onChange={(e) =>
                        updateStyleField('shadow', {
                          ...style.shadow,
                          color: e.target.value,
                        })
                      }
                      className="w-7 h-7 rounded border border-slate-200 dark:border-zinc-800 p-0.5"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Blur: {style.shadow.blur}px</span>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={style.shadow.blur}
                      onChange={(e) =>
                        updateStyleField('shadow', {
                          ...style.shadow,
                          blur: Number(e.target.value),
                        })
                      }
                      className="w-32 accent-[#635BFF]"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Offset Y: {style.shadow.offsetY}px</span>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      value={style.shadow.offsetY}
                      onChange={(e) =>
                        updateStyleField('shadow', {
                          ...style.shadow,
                          offsetY: Number(e.target.value),
                        })
                      }
                      className="w-32 accent-[#635BFF]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Background Box */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={style.background.enabled}
                    onChange={(e) =>
                      updateStyleField('background', {
                        ...style.background,
                        enabled: e.target.checked,
                      })
                    }
                    className="rounded border-slate-300 text-[#635BFF] focus:ring-[#635BFF]"
                  />
                  Background Box
                </label>
              </div>

              {style.background.enabled && (
                <div className="space-y-2.5 pl-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style.background.color}
                      onChange={(e) =>
                        updateStyleField('background', {
                          ...style.background,
                          color: e.target.value,
                        })
                      }
                      className="w-7 h-7 rounded border border-slate-200 dark:border-zinc-800 p-0.5"
                    />
                    <input
                      type="text"
                      value={style.background.color}
                      onChange={(e) =>
                        updateStyleField('background', {
                          ...style.background,
                          color: e.target.value,
                        })
                      }
                      className="flex-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Padding: {style.background.padding}px</span>
                    <input
                      type="range"
                      min="2"
                      max="32"
                      value={style.background.padding}
                      onChange={(e) =>
                        updateStyleField('background', {
                          ...style.background,
                          padding: Number(e.target.value),
                        })
                      }
                      className="w-32 accent-[#635BFF]"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Radius: {style.background.radius}px</span>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={style.background.radius}
                      onChange={(e) =>
                        updateStyleField('background', {
                          ...style.background,
                          radius: Number(e.target.value),
                        })
                      }
                      className="w-32 accent-[#635BFF]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MOTION & ANIMATION */}
        {activeTab === 'animation' && (
          <div className="space-y-5">
            {/* Entrance Motion */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Entrance Animation
              </label>
              <select
                value={style.animation.entrance}
                onChange={(e) =>
                  updateStyleField('animation', {
                    ...style.animation,
                    entrance: e.target.value as any,
                  })
                }
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-slate-900 dark:text-zinc-100"
              >
                <option value="none">None (Instant Cut)</option>
                <option value="pop">Pop (Punchy Spring Scale)</option>
                <option value="fade">Fade In</option>
                <option value="slide-up">Slide Up</option>
                <option value="slide-down">Slide Down</option>
                <option value="bounce">Bounce</option>
              </select>
            </div>

            {/* Word Highlight Mode */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={style.wordHighlight.enabled}
                    onChange={(e) =>
                      updateStyleField('wordHighlight', {
                        ...style.wordHighlight,
                        enabled: e.target.checked,
                      })
                    }
                    className="rounded border-slate-300 text-[#635BFF] focus:ring-[#635BFF]"
                  />
                  Word-by-Word Kinetic Highlight
                </label>
              </div>

              {style.wordHighlight.enabled && (
                <div className="space-y-3 pl-6">
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400">Highlight Style</span>
                    <select
                      value={style.wordHighlight.mode}
                      onChange={(e) =>
                        updateStyleField('wordHighlight', {
                          ...style.wordHighlight,
                          mode: e.target.value as any,
                        })
                      }
                      className="w-full text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1.5 text-slate-900 dark:text-zinc-100"
                    >
                      <option value="current-word">Electric Active Word Color</option>
                      <option value="scale">Pop Scale Active Word</option>
                      <option value="karaoke-fill">Karaoke Progressive Fill</option>
                      <option value="background">Word Capsule Highlight</option>
                      <option value="color">Simple Word Color</option>
                    </select>
                  </div>

                  {/* Highlight Color */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-400">Active Word Color</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={style.wordHighlight.color}
                        onChange={(e) =>
                          updateStyleField('wordHighlight', {
                            ...style.wordHighlight,
                            color: e.target.value,
                          })
                        }
                        className="w-7 h-7 rounded border border-slate-200 dark:border-zinc-800 p-0.5"
                      />
                      <input
                        type="text"
                        value={style.wordHighlight.color}
                        onChange={(e) =>
                          updateStyleField('wordHighlight', {
                            ...style.wordHighlight,
                            color: e.target.value,
                          })
                        }
                        className="flex-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 py-1"
                      />
                    </div>
                  </div>

                  {/* Scale multiplier */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Word Scale Punch</span>
                      <span className="font-mono text-slate-700 dark:text-zinc-300">
                        {style.wordHighlight.scaleMultiplier.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="1.5"
                      step="0.05"
                      value={style.wordHighlight.scaleMultiplier}
                      onChange={(e) =>
                        updateStyleField('wordHighlight', {
                          ...style.wordHighlight,
                          scaleMultiplier: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#635BFF]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: POSITION & LAYOUT */}
        {activeTab === 'layout' && (
          <div className="space-y-5">
            {/* Quick Position Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Preset Position
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() =>
                    updateStyleField('position', { ...style.position, y: 20 })
                  }
                  className="py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-[#635BFF] font-medium"
                >
                  Top (20%)
                </button>
                <button
                  onClick={() =>
                    updateStyleField('position', { ...style.position, y: 50 })
                  }
                  className="py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-[#635BFF] font-medium"
                >
                  Center (50%)
                </button>
                <button
                  onClick={() =>
                    updateStyleField('position', { ...style.position, y: 75 })
                  }
                  className="py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-[#635BFF] font-medium"
                >
                  Bottom (75%)
                </button>
              </div>
            </div>

            {/* Vertical Y Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Vertical (Y Position)
                </span>
                <span className="font-mono text-slate-700 dark:text-zinc-300">
                  {style.position.y}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={style.position.y}
                onChange={(e) =>
                  updateStyleField('position', {
                    ...style.position,
                    y: Number(e.target.value),
                  })
                }
                className="w-full accent-[#635BFF]"
              />
            </div>

            {/* Max Width Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Container Max Width
                </span>
                <span className="font-mono text-slate-700 dark:text-zinc-300">
                  {style.layout.maxWidth}%
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                value={style.layout.maxWidth}
                onChange={(e) =>
                  updateStyleField('layout', {
                    ...style.layout,
                    maxWidth: Number(e.target.value),
                  })
                }
                className="w-full accent-[#635BFF]"
              />
            </div>

            {/* Safe Area Guides Toggle */}
            <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 space-y-2">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-zinc-100 cursor-pointer">
                <span>Show Safe Area Guides</span>
                <input
                  type="checkbox"
                  checked={showSafeAreas}
                  onChange={(e) => setShowSafeAreas(e.target.checked)}
                  className="rounded border-slate-300 text-[#635BFF] focus:ring-[#635BFF]"
                />
              </label>
              <p className="text-[10px] text-slate-400">
                Overlays UI safe-zones for TikTok, Instagram Reels, and YouTube Shorts to ensure captions are never hidden behind buttons or descriptions.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
