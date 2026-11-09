import { describe, it, expect } from 'vitest';
import {
  isBirthdayOfferActive,
  canEarnSharePoints,
  validateReferralEligibility,
  isValidReferralCode,
  calculateProfileRewards,
  MONTHLY_SHARE_POINTS_CAP,
} from '../lib/loyalty';

describe('Birthday Special Window (Section 15.6, P1-BDY-02)', () => {
  it('returns true on the exact birthday', () => {
    const today = new Date(2026, 4, 15); // May 15, 2026
    expect(isBirthdayOfferActive(15, 5, today)).toBe(true);
  });

  it('returns true 5 days before birthday (within 7-day window)', () => {
    const today = new Date(2026, 4, 10); // May 10, 2026
    expect(isBirthdayOfferActive(15, 5, today)).toBe(true);
  });

  it('returns true 7 days after birthday (boundary)', () => {
    const today = new Date(2026, 4, 22); // May 22, 2026
    expect(isBirthdayOfferActive(15, 5, today)).toBe(true);
  });

  it('returns false 8 days after birthday (outside window)', () => {
    const today = new Date(2026, 4, 23); // May 23, 2026
    expect(isBirthdayOfferActive(15, 5, today)).toBe(false);
  });

  it('handles year boundary transitions (Dec 31 birthday checked on Jan 3)', () => {
    const today = new Date(2027, 0, 3); // Jan 3, 2027
    expect(isBirthdayOfferActive(31, 12, today)).toBe(true);
  });

  it('returns false for invalid day or month', () => {
    const today = new Date(2026, 4, 15);
    expect(isBirthdayOfferActive(0, 5, today)).toBe(false);
    expect(isBirthdayOfferActive(15, 13, today)).toBe(false);
  });
});

describe('Share & Earn Monthly Cap (Section 15.4, P1-SHR-04)', () => {
  it('allows full points when well under the 200 pts monthly cap', () => {
    const result = canEarnSharePoints(50, 20);
    expect(result.allowed).toBe(true);
    expect(result.grantedPoints).toBe(20);
  });

  it('partially grants points when near the monthly cap', () => {
    const result = canEarnSharePoints(190, 20);
    expect(result.allowed).toBe(true);
    expect(result.grantedPoints).toBe(10); // 200 - 190
  });

  it('blocks points when monthly cap of 200 is reached', () => {
    const result = canEarnSharePoints(200, 20);
    expect(result.allowed).toBe(false);
    expect(result.grantedPoints).toBe(0);
  });
});

describe('Referral Fraud & Self-Referral Prevention (Section 15.5)', () => {
  it('blocks self-referral if referrer and referee have the same user ID', () => {
    const result = validateReferralEligibility('user_123', 'user_123');
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('Self-referral is not allowed');
  });

  it('allows valid referral between distinct users and IPs', () => {
    const result = validateReferralEligibility('user_1', 'user_2', '192.168.1.1', '192.168.1.2');
    expect(result.eligible).toBe(true);
  });

  it('blocks referral between distinct users sharing the same non-local IP', () => {
    const result = validateReferralEligibility('user_1', 'user_2', '123.45.67.89', '123.45.67.89');
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('same network IP');
  });
});

describe('Referral Code Format Validation (P1-REF-01)', () => {
  it('accepts valid alphanumeric referral codes', () => {
    expect(isValidReferralCode('MARIYAM25')).toBe(true);
    expect(isValidReferralCode('TEACHER1')).toBe(true);
    expect(isValidReferralCode('KIDS99')).toBe(true);
  });

  it('rejects invalid or malformed codes', () => {
    expect(isValidReferralCode('')).toBe(false);
    expect(isValidReferralCode('AB')).toBe(false); // too short
    expect(isValidReferralCode('MARIYAM!@#')).toBe(false); // special chars
    expect(isValidReferralCode('THISISWAYTOOLONGREFERRALCODE')).toBe(false); // too long
  });
});

describe('Progressive Profile Rewards (Section 15.8)', () => {
  it('awards 10 points per newly filled field', () => {
    const result = calculateProfileRewards(2, 2, 4);
    expect(result.pointsEarned).toBe(20);
    expect(result.isCompleted).toBe(false);
  });

  it('adds 20 points completion bonus when all fields are completed', () => {
    // 1 new field completed, bringing total to 4 of 4
    const result = calculateProfileRewards(1, 4, 4);
    expect(result.pointsEarned).toBe(30); // 10 + 20 bonus
    expect(result.isCompleted).toBe(true);
  });
});

