/**
 * LessonLagoon - Loyalty, Referrals & Birthday Special Rules (Section 15)
 */

export const MONTHLY_SHARE_POINTS_CAP = 200; // Section 15.4, 20.1
export const BIRTHDAY_BONUS_POINTS = 100;    // Section 15.6
export const BIRTHDAY_COUPON_PCT = 25;       // 25% discount coupon
export const BIRTHDAY_WINDOW_DAYS = 7;       // 7 days before and after
export const REFERRAL_REFERRER_POINTS = 100; // Section 15.5, 20.1
export const REFERRAL_FRIEND_POINTS = 50;
export const PROFILE_FIELD_REWARD = 10;      // Section 15.8
export const PROFILE_COMPLETION_BONUS = 20;

/**
 * Check if the birthday offer is active (within 7 days either side of the user's birth day/month)
 * P1-BDY-02: Valid 7 days before to 7 days after the birthday.
 */
export function isBirthdayOfferActive(
  birthDay: number,
  birthMonth: number, // 1-12
  now: Date = new Date()
): boolean {
  if (!birthDay || !birthMonth || birthDay < 1 || birthDay > 31 || birthMonth < 1 || birthMonth > 12) {
    return false;
  }

  const currentYear = now.getFullYear();

  // Create birthday date for current year, previous year, and next year to handle year transitions (e.g. Dec 30 -> Jan 5)
  const candidateYears = [currentYear - 1, currentYear, currentYear + 1];

  for (const year of candidateYears) {
    // Note: JS month is 0-indexed
    const bday = new Date(year, birthMonth - 1, birthDay);

    // Difference in milliseconds
    const diffMs = now.getTime() - bday.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays >= -BIRTHDAY_WINDOW_DAYS && diffDays <= BIRTHDAY_WINDOW_DAYS) {
      return true;
    }
  }

  return false;
}

/**
 * Validates share points earning against the monthly cap (P1-SHR-04: max 200 pts/month)
 */
export function canEarnSharePoints(
  currentMonthPoints: number,
  pointsToAdd: number,
  monthlyCap: number = MONTHLY_SHARE_POINTS_CAP
): { allowed: boolean; grantedPoints: number } {
  if (currentMonthPoints >= monthlyCap) {
    return { allowed: false, grantedPoints: 0 };
  }

  const remaining = monthlyCap - currentMonthPoints;
  const granted = Math.min(remaining, pointsToAdd);

  return {
    allowed: granted > 0,
    grantedPoints: granted,
  };
}

/**
 * Validates referral eligibility (P1-REF-02, P1-SHR-02)
 * Fraud check: Self-referral blocked (same user ID or matching IP)
 */
export function validateReferralEligibility(
  referrerId: string,
  refereeId: string,
  refereeIp?: string,
  referrerIp?: string
): { eligible: boolean; reason?: string } {
  if (referrerId === refereeId) {
    return { eligible: false, reason: 'Self-referral is not allowed' };
  }

  if (refereeIp && referrerIp && refereeIp === referrerIp && refereeIp !== '127.0.0.1' && refereeIp !== '::1') {
    return { eligible: false, reason: 'Referral sharing the same network IP is blocked' };
  }

  return { eligible: true };
}

/**
 * Validates referral code pattern (e.g. "MARIYAM25", 4 to 12 alphanumeric chars)
 */
export function isValidReferralCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const clean = code.trim().toUpperCase();
  return /^[A-Z0-9]{4,12}$/.test(clean);
}

/**
 * Calculate progressive profile rewards (Section 15.8)
 * 10 points per item saved for the first time + 20 points completion bonus when all fields done
 */
export function calculateProfileRewards(
  newlyCompletedCount: number,
  totalCompletedCount: number,
  totalPossibleFields: number
): { pointsEarned: number; isCompleted: boolean } {
  const pointsFromFields = newlyCompletedCount * PROFILE_FIELD_REWARD;
  const isCompleted = totalCompletedCount >= totalPossibleFields;
  const completionBonus = isCompleted ? PROFILE_COMPLETION_BONUS : 0;

  return {
    pointsEarned: pointsFromFields + completionBonus,
    isCompleted,
  };
}
