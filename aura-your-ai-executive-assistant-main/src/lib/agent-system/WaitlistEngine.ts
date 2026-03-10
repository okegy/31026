// WaitlistEngine.ts
import { mockWaitlist } from './mockWaitlist';

export class WaitlistRankingEngine {
  public static rankPatients(specialityNeeded: string) {
    // Advanced Score = (wait_since * 0.5) + (urgency * 0.3) + (distance_weight * 0.2) + (is_vip ? 5 : 0) - (past_cancellations * 2)
    // Distance weight logic: closer is better, so max_distance - distance. Let's say max_distance is 50.
    const eligiblePatients = mockWaitlist.filter(p => p.speciality_needed === specialityNeeded);

    const ranked = eligiblePatients.map(patient => {
      const distanceWeight = Math.max(0, 50 - patient.distance_km);
      const vipBonus = patient.is_vip ? 5 : 0;
      const cancellationPenalty = (patient.past_cancellations || 0) * 2;
      const score = (patient.wait_since * 0.5) + (patient.urgency * 0.3) + (distanceWeight * 0.2) + vipBonus - cancellationPenalty;
      return { ...patient, score, vipBonus, cancellationPenalty };
    });

    // Sort by descending score
    ranked.sort((a, b) => b.score - a.score);

    // Return Top 3
    return ranked.slice(0, 3);
  }
}
