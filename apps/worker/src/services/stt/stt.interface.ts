export interface STTWord {
  id: string;
  text: string;
  start: number; // seconds
  end: number;   // seconds
  confidence: number; // 0.0 - 1.0
}

export interface STTSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  words: STTWord[];
}

export interface STTResult {
  language: string;
  duration: number;
  text: string;
  segments: STTSegment[];
}

export interface STTOptions {
  language?: string; // 'auto' or ISO 639-1 code ('en', 'hi', 'gu', 'es', 'fr', etc.)
  model?: string;    // 'tiny' | 'base' | 'small' | 'medium' | 'large-v3'
  temperature?: number;
  initialPrompt?: string;
  wordTimestamps?: boolean;
}

export interface ISTTEngine {
  readonly name: string;
  transcribe(audioPath: string, options?: STTOptions): Promise<STTResult>;
}

