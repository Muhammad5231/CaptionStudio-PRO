#!/usr/bin/env python3
"""
CaptionStudio PRO — Python Whisper STT Bridge
Transcribes 16kHz mono audio into normalized word-level and segment-level timestamps.
"""

import sys
import json
import os

# Guarantee UTF-8 encoding across Windows/Linux stdout/stderr
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Ensure standard ffmpeg paths are available to whisper subprocesses
if sys.platform == 'win32':
    kdenlive_bin = r"C:\Program Files\Kdenlive\bin"
    if os.path.exists(kdenlive_bin) and kdenlive_bin not in os.environ.get("PATH", ""):
        os.environ["PATH"] = f"{kdenlive_bin};{os.environ.get('PATH', '')}"

try:
    import whisper
except ImportError:
    print(json.dumps({
        "error": "WHISPER_NOT_INSTALLED",
        "message": "OpenAI Whisper module is not installed in Python environment."
    }))
    sys.exit(1)


def clean_repetitions(words, max_repeats=3):
    """Filters out unnatural repetitive loops that can occur on non-speech tones."""
    if not words:
        return words
    cleaned = []
    current_word = None
    count = 0
    for w in words:
        norm = w["text"].lower().strip()
        if norm == current_word:
            count += 1
            if count <= max_repeats:
                cleaned.append(w)
        else:
            current_word = norm
            count = 1
            cleaned.append(w)
    return cleaned


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "MISSING_AUDIO_PATH", "message": "Audio file path required."}))
        sys.exit(1)

    audio_path = sys.argv[1]
    model_name = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] else "tiny"
    language = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] not in ("auto", "", "None") else None
    temperature = float(sys.argv[4]) if len(sys.argv) > 4 and sys.argv[4] else 0.0

    if not os.path.exists(audio_path):
        print(json.dumps({"error": "AUDIO_FILE_NOT_FOUND", "message": f"Audio file not found: {audio_path}"}))
        sys.exit(1)

    try:
        model = whisper.load_model(model_name)
        result = model.transcribe(
            audio_path,
            language=language,
            temperature=temperature,
            word_timestamps=True,
            verbose=False,
        )

        detected_language = result.get("language", "en")
        full_text = result.get("text", "").strip()

        normalized_segments = []
        seg_counter = 1
        word_counter = 1

        for raw_seg in result.get("segments", []):
            seg_start = round(float(raw_seg.get("start", 0.0)), 3)
            seg_end = round(float(raw_seg.get("end", 0.0)), 3)
            seg_text = raw_seg.get("text", "").strip()

            words_list = []
            for raw_w in raw_seg.get("words", []):
                w_text = raw_w.get("word", "").strip()
                if not w_text:
                    continue
                w_start = round(float(raw_w.get("start", seg_start)), 3)
                w_end = round(float(raw_w.get("end", seg_end)), 3)
                w_prob = round(float(raw_w.get("probability", 1.0)), 3)

                words_list.append({
                    "id": f"w_{word_counter:04d}",
                    "text": w_text,
                    "start": w_start,
                    "end": max(w_end, w_start + 0.05),
                    "confidence": max(0.0, min(1.0, w_prob)),
                })
                word_counter += 1

            filtered_words = clean_repetitions(words_list)
            if filtered_words or seg_text:
                normalized_segments.append({
                    "id": f"seg_{seg_counter:03d}",
                    "start": seg_start,
                    "end": seg_end,
                    "text": seg_text,
                    "words": filtered_words,
                })
                seg_counter += 1

        duration = 0.0
        if normalized_segments:
            duration = round(max(s["end"] for s in normalized_segments), 3)

        output = {
            "success": True,
            "language": detected_language,
            "duration": duration,
            "text": full_text,
            "segments": normalized_segments,
        }

        print(json.dumps(output, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({
            "error": "TRANSCRIPTION_FAILED",
            "message": str(e),
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()

