import { describe, it, expect } from 'vitest';
import { createSliderChallenge, verifySliderResponse } from '../lib/sliderCaptcha';

describe('Slider CAPTCHA Verification (Section 15.10, P1-RQR-04)', () => {
  it('generates a valid challenge with target between 30 and 85', () => {
    const challenge = createSliderChallenge();
    expect(challenge.token).toBeDefined();
    expect(challenge.targetX).toBeGreaterThanOrEqual(30);
    expect(challenge.targetX).toBeLessThanOrEqual(85);
    expect(challenge.expiresAt).toBeGreaterThan(Date.now());
  });

  it('validates a correct human response within tolerance and reasonable time', () => {
    const challenge = createSliderChallenge();
    // Simulate natural drag taking 1.5 seconds and landing right at target
    const result = verifySliderResponse(challenge.token, challenge.targetX, 1500);
    expect(result.valid).toBe(true);
  });

  it('rejects bot-like instant submissions under minimum timing threshold', () => {
    const challenge = createSliderChallenge();
    // Instant submission (200ms)
    const result = verifySliderResponse(challenge.token, challenge.targetX, 200);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Submission too fast');
  });

  it('rejects position mismatch outside tolerance', () => {
    const challenge = createSliderChallenge();
    // Land 20% away from target
    const result = verifySliderResponse(challenge.token, challenge.targetX + 20, 2000);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('not aligned accurately');
  });
});

