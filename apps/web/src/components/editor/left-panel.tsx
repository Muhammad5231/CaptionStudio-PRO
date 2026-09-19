'use client';

import React, { useState } from 'react';
import {
  FileText,
  Type,
  Video,
  Plus,
  Scissors,
  Combine,
  Trash2,
  Search,
  Clock,
} from 'lucide-react';
import { Button, Input } from '@captionstudio/ui';
import { useEditorStore } from '@/stores/editor-store';

export function EditorLeftPanel() {
  const [activeTab, setActiveTab] = useState<'captions' | 'words' | 'assets'>('captions');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    captions,
    selectedCaptionId,
    selectCaption,
    updateCaptionText,
    updateCaptionTiming,
    splitCaption,
    mergeCaptionWithNext,
    deleteCaption,
    addCaptionAtPlayhead,
    currentTime,
    setCurrentTime,
    videoDuration,
  } = useEditorStore();

  const filteredCaptions = captions.filter((c) =>
    c.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCaption = captions.find((c) => c.id === selectedCaptionId);

  return (
    <aside className="w-80 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shrink-0 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 p-1 bg-slate-50/50 dark:bg-zinc-900/50">
        <button
          onClick={() => setActiveTab('captions')}
          className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'captions'
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-50 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-300'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Captions ({captions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('words')}
          className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'words'
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-50 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-300'
          }`}
        >
          <Type className="h-3.5 w-3.5" />
          <span>Words</span>
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'assets'
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-50 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-300'
          }`}
        >
          <Video className="h-3.5 w-3.5" />
          <span>Assets</span>
        </button>
      </div>

      {/* Captions Tab View */}
      {activeTab === 'captions' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Controls */}
          <div className="p-3 border-b border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Subtitle Cues</span>
              <Button size="sm" variant="outline" onClick={addCaptionAtPlayhead} className="h-7 text-xs px-2">
                <Plus className="h-3 w-3 mr-1" />
                <span>Add Cue</span>
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search captions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
              />
            </div>
          </div>

          {/* Cue List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100 dark:divide-zinc-900">
            {filteredCaptions.length > 0 ? (
              filteredCaptions.map((cue, idx) => {
                const isSelected = cue.id === selectedCaptionId;
                const isPlayingNow = currentTime >= cue.startTime && currentTime <= cue.endTime;

                return (
                  <div
                    key={cue.id}
                    onClick={() => {
                      selectCaption(cue.id);
                      setCurrentTime(cue.startTime);
                    }}
                    className={`pt-2.5 rounded-lg p-2.5 cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-[#635BFF] bg-[#635BFF]/5 shadow-sm'
                        : isPlayingNow
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-zinc-900/50'
                    }`}
                  >
                    {/* Timestamp range & actions */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-600 dark:text-zinc-300">#{idx + 1}</span>
                        <input
                          type="number"
                          step="0.1"
                          value={cue.startTime}
                          onChange={(e) =>
                            updateCaptionTiming(cue.id, parseFloat(e.target.value) || 0, cue.endTime)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="w-14 px-1 py-0.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-center text-[10px]"
                        />
                        <span>&rarr;</span>
                        <input
                          type="number"
                          step="0.1"
                          value={cue.endTime}
                          onChange={(e) =>
                            updateCaptionTiming(cue.id, cue.startTime, parseFloat(e.target.value) || cue.startTime + 0.5)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="w-14 px-1 py-0.5 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-center text-[10px]"
                        />
                      </div>

                      {/* Split, Merge, Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            splitCaption(cue.id);
                          }}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
                          title="Split Cue (S)"
                        >
                          <Scissors className="h-3 w-3" />
                        </button>
                        {idx < captions.length - 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              mergeCaptionWithNext(cue.id);
                            }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200"
                            title="Merge with Next (M)"
                          >
                            <Combine className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCaption(cue.id);
                          }}
                          className="p-1 hover:bg-red-500/10 rounded text-slate-400 hover:text-red-600"
                          title="Delete Cue"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Text Input */}
                    <textarea
                      value={cue.text}
                      onChange={(e) => updateCaptionText(cue.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      rows={2}
                      className="w-full text-xs font-medium bg-transparent text-slate-900 dark:text-zinc-100 resize-none focus:outline-none focus:bg-slate-100 dark:focus:bg-zinc-900 p-1 rounded transition-colors"
                    />
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <FileText className="h-8 w-8 mx-auto text-slate-300 dark:text-zinc-700" />
                <p>No captions match your filter.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Words Inspection Tab */}
      {activeTab === 'words' && (
        <div className="flex-1 p-3 overflow-y-auto space-y-3">
          {selectedCaption ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Word Timing Breakdown</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {selectedCaption.words.length} words
                </span>
              </div>

              <div className="space-y-2">
                {selectedCaption.words.map((w, wIdx) => {
                  const isWordCurrent = currentTime >= w.startTime && currentTime <= w.endTime;

                  return (
                    <div
                      key={w.id || wIdx}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                        isWordCurrent
                          ? 'border-[#635BFF] bg-[#635BFF]/10 font-bold text-[#635BFF]'
                          : 'border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <span>{w.text}</span>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                        <span>{w.startTime.toFixed(2)}s</span>
                        <span>&rarr;</span>
                        <span>{w.endTime.toFixed(2)}s</span>
                        {w.confidence !== undefined && (
                          <span className="text-[9px] bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded">
                            {Math.round(w.confidence * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <Clock className="h-8 w-8 mx-auto text-slate-300 dark:text-zinc-700" />
              <p>Select a caption cue to inspect word timestamps.</p>
            </div>
          )}
        </div>
      )}

      {/* Assets Tab */}
      {activeTab === 'assets' && (
        <div className="flex-1 p-3 overflow-y-auto space-y-4 text-xs">
          <div className="border border-slate-200 dark:border-zinc-800 rounded-lg p-3 space-y-2">
            <span className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Video className="h-4 w-4 text-[#635BFF]" />
              <span>Source Media</span>
            </span>
            <div className="text-[11px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  {videoDuration ? `${videoDuration.toFixed(1)}s` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Captions</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">{captions.length} cues</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

