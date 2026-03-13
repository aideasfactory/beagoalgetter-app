import type { ReactionType } from '@/types/database.example';

export interface ReactionConfig {
  reactionType: ReactionType;
  iconOutline: string;
  iconFilled: string;
  activeColor: string;
  inactiveColor: string;
}

const REACTION_CONFIGS: Record<ReactionType, ReactionConfig> = {
  like: {
    reactionType: 'like',
    iconOutline: 'heart-outline',
    iconFilled: 'heart',
    activeColor: '#ef4444',
    inactiveColor: 'rgba(255,255,255,0.6)',
  },
  celebrate: {
    reactionType: 'celebrate',
    iconOutline: 'ribbon-outline',
    iconFilled: 'ribbon',
    activeColor: '#eab308',
    inactiveColor: 'rgba(255,255,255,0.6)',
  },
  encourage: {
    reactionType: 'encourage',
    iconOutline: 'fitness-outline',
    iconFilled: 'fitness',
    activeColor: '#f59e0b',
    inactiveColor: 'rgba(255,255,255,0.6)',
  },
};

export function getReactionType(
  postType: 'success' | 'fail' | 'joined',
  isChallengeComplete?: boolean,
): ReactionType {
  if (postType === 'joined') return 'celebrate';
  if (postType === 'fail' && !isChallengeComplete) return 'encourage';
  return 'like';
}

export function getReactionConfig(
  postType: 'success' | 'fail' | 'joined',
  isChallengeComplete?: boolean,
): ReactionConfig {
  const type = getReactionType(postType, isChallengeComplete);
  return REACTION_CONFIGS[type];
}
