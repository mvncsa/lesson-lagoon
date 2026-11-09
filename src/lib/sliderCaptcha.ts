export interface SliderChallenge {
  token: string;
  targetX: number; // 0 to 100 percentage or pixel offset
  expiresAt: number;
}

const SECRET_SALT = 'lesson-lagoon-captcha-salt-mv';

export function createSliderChallenge(): SliderChallenge {
  // Random target between 30% and 85% width
  const targetX = Math.floor(Math.random() * 55) + 30;
  const expiresAt = Date.now() + 120000; // 2 minutes expiry
  const payload = `${targetX}:${expiresAt}:${SECRET_SALT}`;
  // Simple token encoding
  const token = typeof Buffer !== 'undefined' 
    ? Buffer.from(payload).toString('base64') 
    : btoa(payload);

  return {
    token,
    targetX,
    expiresAt,
  };
}

export function verifySliderResponse(
  token: string,
  userPositionX: number,
  timeTakenMs: number
): { valid: boolean; reason?: string } {
  if (timeTakenMs < 1200) {
    return { valid: false, reason: 'Submission too fast. Please slide naturally.' };
  }

  try {
    const raw = typeof Buffer !== 'undefined'
      ? Buffer.from(token, 'base64').toString('utf-8')
      : atob(token);
    const parts = raw.split(':');
    if (parts.length !== 3 || parts[2] !== SECRET_SALT) {
      return { valid: false, reason: 'Invalid challenge token' };
    }

    const targetX = parseInt(parts[0], 10);
    const expiresAt = parseInt(parts[1], 10);

    if (Date.now() > expiresAt) {
      return { valid: false, reason: 'Challenge expired. Please try again.' };
    }

    // Tolerance of +/- 6%
    const tolerance = 6;
    const diff = Math.abs(userPositionX - targetX);
    if (diff > tolerance) {
      return { valid: false, reason: 'Slider piece not aligned accurately. Please try again.' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'Invalid CAPTCHA signature' };
  }
}

