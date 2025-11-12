import React from 'react';
import { router } from 'expo-router';
import { Onboarding } from '@/components';
import { useSession } from '@/context';

const OnboardingScreen = () => {
  const { setHasLaunched } = useSession();

  const handleGetStarted = () => {
    setHasLaunched(true);
    router.push('/signup');
  };

  const handleLogin = () => {
    setHasLaunched(true);
    router.push('/login');
  };

  return (
    <Onboarding 
      onGetStarted={handleGetStarted}
      onLogin={handleLogin}
    />
  );
};

export default OnboardingScreen;