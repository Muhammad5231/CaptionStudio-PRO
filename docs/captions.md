# Subtitle & Caption Engine

The `@captionstudio/captions` package handles all parsing, tokenization, timekeeping, grouping, and styling transformations.

## Core Data Model

```typescript
interface CaptionWord {
  id: string;
  text: string;
  start: number; // in seconds (e.g. 1.250)
  end: number;   // in seconds
  confidence?: number;
  speaker?: string;
  highlighted?: boolean;
}

interface CaptionLine {
  id: string;
  start: number;
  end: number;
  text: string;
  words: CaptionWord[];
}
```

## Features
- **Multi-Format Parsers**: Native parsing for SubRip (`.srt`), WebVTT (`.vtt`), and SubStation Alpha (`.ass`, `.ssa`).
- **Grouping Algorithm**: Automatically breaks spoken text into optimal 3 to 4 word clusters with punctuation breaks, avoiding overcrowded screen lines on 9:16 vertical videos.
- **Serializers**: Exports back to standard SRT, WebVTT, and stylized ASS files for broadcast and video burning.

