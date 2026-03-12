export const shouldShowAds = (userProfile: any): boolean => {
  // If plan is not set, assume 'free'. Premium users should have plan === 'premium'
  return !userProfile?.plan || userProfile.plan === "free";
};
