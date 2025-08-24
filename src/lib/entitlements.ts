// Entitlements system for managing user access to features
// This file handles user permissions and feature limits based on subscription status

export interface User {
  id: string;
  email: string;
  isPro: boolean;
  subscriptionStatus: 'none' | 'active' | 'canceled' | 'expired';
  createdAt: Date;
  proSince?: Date;
  proUntil?: Date;
}

// Mock user database - in a real app, this would come from your database
const mockUsers: Record<string, User> = {
  'user_free': {
    id: 'user_free',
    email: 'free@example.com',
    isPro: false,
    subscriptionStatus: 'none',
    createdAt: new Date('2024-01-01')
  },
  'user_pro': {
    id: 'user_pro',
    email: 'pro@example.com',
    isPro: true,
    subscriptionStatus: 'active',
    createdAt: new Date('2024-01-01'),
    proSince: new Date('2024-01-15')
  },
  'user_expired': {
    id: 'user_expired',
    email: 'expired@example.com',
    isPro: false,
    subscriptionStatus: 'canceled',
    createdAt: new Date('2024-01-01'),
    proSince: new Date('2024-01-15'),
    proUntil: new Date('2024-02-15')
  }
};

/**
 * Check if a user can access a specific feature
 * @param userId - The user's ID
 * @param feature - The feature to check access for
 * @returns boolean indicating if the user can access the feature
 */
export const canUse = (userId: string, feature: string): boolean => {
  if (!userId || !feature) return false;
  
  const user = mockUsers[userId];
  if (!user) return false;
  
  // Basic features available to all users
  if (feature === 'basic_chat') return true;
  if (feature === 'basic_search') return true;
  if (feature === 'file_upload') return true;
  
  // Premium features require Pro subscription
  if (feature === 'premium_chat') return user.isPro;
  if (feature === 'advanced_search') return user.isPro;
  if (feature === 'unlimited_uploads') return user.isPro;
  if (feature === 'priority_support') return user.isPro;
  if (feature === 'billing_access') return user.isPro;
  
  // Unknown features are denied by default
  return false;
};

/**
 * Get the user's subscription tier
 * @param userId - The user's ID
 * @returns The user's tier: 'free', 'pro', or 'expired'
 */
export const getUserTier = (userId: string): string => {
  if (!userId) return 'free';
  
  const user = mockUsers[userId];
  if (!user) return 'free';
  
  if (user.isPro && user.subscriptionStatus === 'active') return 'pro';
  if (user.subscriptionStatus === 'canceled' || user.subscriptionStatus === 'expired') return 'expired';
  return 'free';
};

/**
 * Get feature limits for a user based on their tier
 * @param userId - The user's ID
 * @returns Object containing feature limits
 */
export const getFeatureLimits = (userId: string) => {
  const tier = getUserTier(userId);
  
  if (tier === 'pro') {
    return {
      chatMessages: 1000,
      fileUploads: 100,
      apiCalls: 10000,
      storageGB: 50,
      prioritySupport: true
    };
  }
  
  return {
    chatMessages: 100,
    fileUploads: 5,
    apiCalls: 1000,
    storageGB: 1,
    prioritySupport: false
  };
};

/**
 * Check if a user has exceeded their limits
 * @param userId - The user's ID
 * @param feature - The feature to check
 * @param currentUsage - Current usage count
 * @returns boolean indicating if limit is exceeded
 */
export const hasExceededLimit = (userId: string, feature: string, currentUsage: number): boolean => {
  const limits = getFeatureLimits(userId);
  
  switch (feature) {
    case 'chatMessages':
      return currentUsage >= limits.chatMessages;
    case 'fileUploads':
      return currentUsage >= limits.fileUploads;
    case 'apiCalls':
      return currentUsage >= limits.apiCalls;
    case 'storageGB':
      return currentUsage >= limits.storageGB;
    default:
      return false;
  }
};

/**
 * Get user's remaining usage for a feature
 * @param userId - The user's ID
 * @param feature - The feature to check
 * @param currentUsage - Current usage count
 * @returns Remaining usage count
 */
export const getRemainingUsage = (userId: string, feature: string, currentUsage: number): number => {
  const limits = getFeatureLimits(userId);
  
  switch (feature) {
    case 'chatMessages':
      return Math.max(0, limits.chatMessages - currentUsage);
    case 'fileUploads':
      return Math.max(0, limits.fileUploads - currentUsage);
    case 'apiCalls':
      return Math.max(0, limits.apiCalls - currentUsage);
    case 'storageGB':
      return Math.max(0, limits.storageGB - currentUsage);
    default:
      return 0;
  }
};

/**
 * Upgrade a user to Pro status
 * @param userId - The user's ID
 * @returns boolean indicating success
 */
export const upgradeToPro = (userId: string): boolean => {
  const user = mockUsers[userId];
  if (!user) return false;
  
  user.isPro = true;
  user.subscriptionStatus = 'active';
  user.proSince = new Date();
  
  return true;
};

/**
 * Downgrade a user to Free status
 * @param userId - The user's ID
 * @returns boolean indicating success
 */
export const downgradeToFree = (userId: string): boolean => {
  const user = mockUsers[userId];
  if (!user) return false;
  
  user.isPro = false;
  user.subscriptionStatus = 'canceled';
  user.proUntil = new Date();
  
  return true;
};

/**
 * Get all available features for a user
 * @param userId - The user's ID
 * @returns Array of available feature names
 */
export const getAvailableFeatures = (userId: string): string[] => {
  const features = [
    'basic_chat',
    'basic_search',
    'file_upload',
    'premium_chat',
    'advanced_search',
    'unlimited_uploads',
    'priority_support',
    'billing_access'
  ];
  
  return features.filter(feature => canUse(userId, feature));
};

/**
 * Check if a user can upgrade to Pro
 * @param userId - The user's ID
 * @returns boolean indicating if upgrade is possible
 */
export const canUpgrade = (userId: string): boolean => {
  const user = mockUsers[userId];
  if (!user) return false;
  
  return !user.isPro || user.subscriptionStatus === 'canceled';
};

/**
 * Get user's subscription status details
 * @param userId - The user's ID
 * @returns Object containing subscription details
 */
export const getSubscriptionDetails = (userId: string) => {
  const user = mockUsers[userId];
  if (!user) return null;
  
  return {
    isPro: user.isPro,
    status: user.subscriptionStatus,
    proSince: user.proSince,
    proUntil: user.proUntil,
    canUpgrade: canUpgrade(userId),
    tier: getUserTier(userId)
  };
};

