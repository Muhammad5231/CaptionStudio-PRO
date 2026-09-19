import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseSRT, parseVTT, serializeToSRT, serializeToVTT, groupWordsIntoLines } from '../packages/captions/src/index';
import { CaptionWord } from '../packages/types/src/index';

describe('Caption Parsing & Serialization Engine', () => {
  const sampleSRT = `1
00:00:01,000 --> 00:00:03,500
Hello world, this is CaptionStudio PRO.

2
00:00:04,000 --> 00:00:06,200
Creating captions that make videos impossible to ignore.
`;

  it('should parse SRT subtitles into lines and word tokens accurately', () => {
    const lines = parseSRT(sampleSRT);
    assert.strictEqual(lines.length, 2);

    assert.strictEqual(lines[0].start, 1.0);
    assert.strictEqual(lines[0].end, 3.5);
    assert.strictEqual(lines[0].text, 'Hello world, this is CaptionStudio PRO.');
    assert.ok(lines[0].words.length > 0);

    assert.strictEqual(lines[1].start, 4.0);
    assert.strictEqual(lines[1].end, 6.2);
  });

  it('should serialize parsed captions back to valid SRT format', () => {
    const lines = parseSRT(sampleSRT);
    const serialized = serializeToSRT(lines);

    assert.ok(serialized.includes('00:00:01,000 --> 00:00:03,500'));
    assert.ok(serialized.includes('Hello world, this is CaptionStudio PRO.'));
    assert.ok(serialized.includes('00:00:04,000 --> 00:00:06,200'));
  });

  it('should group continuous stream of words into readable lines based on maxWordsPerLine', () => {
    const words: CaptionWord[] = [
      { id: '1', text: 'This', start: 0.1, end: 0.4 },
      { id: '2', text: 'is', start: 0.4, end: 0.6 },
      { id: '3', text: 'a', start: 0.6, end: 0.8 },
      { id: '4', text: 'test', start: 0.8, end: 1.1 },
      { id: '5', text: 'for', start: 1.1, end: 1.3 },
      { id: '6', text: 'retention.', start: 1.3, end: 1.8 },
    ];

    const grouped = groupWordsIntoLines(words, { maxWordsPerLine: 3 });
    assert.strictEqual(grouped.length, 2);
    assert.strictEqual(grouped[0].words.length, 3);
    assert.strictEqual(grouped[1].words.length, 3);
    assert.strictEqual(grouped[0].text, 'This is a');
    assert.strictEqual(grouped[1].text, 'test for retention.');
  });

  describe('Phase 5 Caption Style & Kinetic Typography Engine', () => {
    it('should validate CaptionStyle schema with default fallbacks', async () => {
      const { CaptionStyleSchema } = await import('../packages/captions/src/styles/schema');
      const parsed = CaptionStyleSchema.parse({});

      assert.strictEqual(parsed.typography.fontFamily, 'Inter');
      assert.strictEqual(parsed.fill.color, '#FFFFFF');
      assert.strictEqual(parsed.stroke.enabled, true);
      assert.strictEqual(parsed.wordHighlight.enabled, true);
      assert.strictEqual(parsed.position.anchor, 'bottom');
    });

    it('should load all 16 production templates across required categories', async () => {
      const { PRODUCTION_TEMPLATES } = await import('../packages/captions/src/templates/templates');
      assert.strictEqual(PRODUCTION_TEMPLATES.length, 16);

      const requiredCategories = [
        'Trending',
        'Minimal',
        'Bold',
        'Podcast',
        'Gaming',
        'Business',
        'Education',
        'Motivation',
        'Shorts',
        'Reels',
        'TikTok',
        'Cinematic',
        'Karaoke',
        'News',
        'Luxury',
        'Dynamic',
      ];

      for (const cat of requiredCategories) {
        const found = PRODUCTION_TEMPLATES.find((t) => t.category === cat);
        assert.ok(found, `Category "${cat}" must have a production template`);
        assert.ok(found.styleConfig.typography.fontFamily);
        assert.ok(found.previewColors.length >= 2);
      }
    });

    it('should apply template without mutating global template object', async () => {
      const { applyTemplate, PRODUCTION_TEMPLATES } = await import('../packages/captions/src/templates/templates');
      const originalViral = PRODUCTION_TEMPLATES.find((t) => t.slug === 'viral-pop')!;
      const originalColor = originalViral.styleConfig.fill.color;

      const customized = applyTemplate('viral-pop', {
        fill: { color: '#FF0000', opacity: 1 },
      });

      assert.strictEqual(customized.fill.color, '#FF0000');
      // Original must remain unaffected
      assert.strictEqual(originalViral.styleConfig.fill.color, originalColor);
    });

    it('should compute deterministic spring physics', async () => {
      const { calculateSpring } = await import('../packages/captions/src/animations/engine');

      assert.strictEqual(calculateSpring(0), 0);
      assert.strictEqual(calculateSpring(1), 1);

      // Spring overshoot check (should reach > 1 during underdamped bounce)
      const midway = calculateSpring(0.5, 8, 180, 1);
      assert.ok(midway > 0.8, 'Spring value at 50% progress should be dynamic');
    });

    it('should evaluate caption frame transforms and word highlights', async () => {
      const { evaluateCaptionFrame } = await import('../packages/captions/src/animations/engine');
      const { CaptionStyleSchema } = await import('../packages/captions/src/styles/schema');

      const style = CaptionStyleSchema.parse({
        wordHighlight: { enabled: true, color: '#FACC15', mode: 'current-word', scaleMultiplier: 1.2 },
      });

      const caption = {
        start: 1.0,
        end: 3.0,
        words: [
          { id: 'w1', text: 'Hello', start: 1.0, end: 1.5 },
          { id: 'w2', text: 'World', start: 1.5, end: 2.0 },
        ],
      };

      // Frame at t=0.5 (before caption) -> not visible
      const before = evaluateCaptionFrame(caption, 0.5, style);
      assert.strictEqual(before.isVisible, false);

      // Frame at t=1.2 (first word active)
      const frame1 = evaluateCaptionFrame(caption, 1.2, style);
      assert.strictEqual(frame1.isVisible, true);
      assert.strictEqual(frame1.words[0].isCurrent, true);
      assert.strictEqual(frame1.words[0].color, '#FACC15');
      assert.strictEqual(frame1.words[1].isCurrent, false);

      // Frame at t=1.8 (second word active)
      const frame2 = evaluateCaptionFrame(caption, 1.8, style);
      assert.strictEqual(frame2.words[0].isPast, true);
      assert.strictEqual(frame2.words[1].isCurrent, true);
    });

    it('should clamp positioning to safe areas across aspect ratios', async () => {
      const { clampToSafeArea } = await import('../packages/captions/src/safe-area/safe-area');

      // Vertical 9:16 safe area clamps right margin from TikTok icons (rightPercent=18 -> max 82%)
      const clamped916 = clampToSafeArea(95, 95, '9:16');
      assert.strictEqual(clamped916.x <= 82, true);
      assert.strictEqual(clamped916.y <= 80, true);

      // Landscape 16:9 has wider margins
      const clamped169 = clampToSafeArea(50, 50, '16:9');
      assert.strictEqual(clamped169.x, 50);
      assert.strictEqual(clamped169.y, 50);
    });

    it('should validate approved font registry', async () => {
      const { isFontApproved } = await import('../packages/captions/src/styles/font-registry');

      assert.strictEqual(isFontApproved('Inter'), true);
      assert.strictEqual(isFontApproved('Plus Jakarta Sans'), true);
      assert.strictEqual(isFontApproved('Montserrat'), true);
      assert.strictEqual(isFontApproved('MaliciousFont_PathTraversal'), false);
    });
  });
});


