import { mockUser } from './auth';
import { withLatency } from './latency';
import type { ReferralSummary } from './types';

const summary: ReferralSummary = {
  code: mockUser.referralCode,
  invitedCount: 7,
  earnedKobo: 3_500_000, // ₦35,000
};

export function getReferralSummary(): Promise<ReferralSummary> {
  return withLatency({ ...summary });
}
