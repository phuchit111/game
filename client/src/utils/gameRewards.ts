export type RewardTier = 'gold' | 'silver' | 'bronze';

export const getScoreTier = (score: number, maxScore: number) => {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  if (ratio >= 0.8) return { tier: 'gold' as RewardTier, label: 'GIS MASTER', description: 'ยอดเยี่ยมมาก' };
  if (ratio >= 0.55) return { tier: 'silver' as RewardTier, label: 'MAP MAKER', description: 'ทำได้ดีมาก' };
  return { tier: 'bronze' as RewardTier, label: 'FIELD EXPLORER', description: 'ผ่านภารกิจแล้ว' };
};
