import { useState } from 'react';
import { Home, Trophy, User, ArrowLeft, Plus, Settings as SettingsIcon } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import Onboarding from './components/Onboarding';
import Login from './components/Login';
import HomePage from './components/HomePage';
import ChallengeList from './components/ChallengeList';
import ChallengeDetails from './components/ChallengeDetails';
import CreateChallenge from './components/CreateChallenge';
import Profile from './components/Profile';
import SettingsPage from './components/SettingsPage';

export type Screen = 
  | 'onboarding' 
  | 'login' 
  | 'signup' 
  | 'home' 
  | 'challenges' 
  | 'challenge-details'
  | 'create-challenge'
  | 'profile'
  | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen('home');
  };

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const selectChallenge = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
    setCurrentScreen('challenge-details');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('login');
  };

  // Bottom navigation items
  const bottomNavItems = [
    { id: 'home', icon: Home, label: 'Home', screen: 'home' as Screen },
    { id: 'challenges', icon: Trophy, label: 'Challenges', screen: 'challenges' as Screen },
    { id: 'profile', icon: User, label: 'Profile', screen: 'profile' as Screen },
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <Onboarding onGetStarted={() => navigateTo('signup')} onLogin={() => navigateTo('login')} />;
      case 'login':
      case 'signup':
        return <Login isSignup={currentScreen === 'signup'} onSuccess={handleLogin} onToggle={() => navigateTo(currentScreen === 'login' ? 'signup' : 'login')} />;
      case 'home':
        return <HomePage onChallengeClick={selectChallenge} />;
      case 'challenges':
        return <ChallengeList onChallengeClick={selectChallenge} onCreateClick={() => navigateTo('create-challenge')} />;
      case 'challenge-details':
        return <ChallengeDetails challengeId={selectedChallengeId} onBack={() => navigateTo('challenges')} />;
      case 'create-challenge':
        return <CreateChallenge onBack={() => navigateTo('challenges')} onComplete={() => navigateTo('challenges')} />;
      case 'profile':
        return <Profile onSettingsClick={() => navigateTo('settings')} />;
      case 'settings':
        return <SettingsPage onBack={() => navigateTo('profile')} onLogout={handleLogout} />;
      default:
        return <HomePage onChallengeClick={selectChallenge} />;
    }
  };

  const showBottomNav = isAuthenticated && !['onboarding', 'login', 'signup', 'challenge-details', 'create-challenge', 'settings'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-black">
      {/* Main Content */}
      <div className={`${showBottomNav ? 'pb-28' : ''}`}>
        {renderScreen()}
      </div>

      {/* Bottom Navigation - iOS Style */}
      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 px-12 pb-6 pt-2 z-50">
          <div className="max-w-md mx-auto bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-full px-4 py-2 shadow-2xl">
            <div className="flex justify-around items-center gap-2">
              {bottomNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.screen;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.screen)}
                    className="flex flex-col items-center gap-1 py-2 px-4 transition-all duration-200 relative rounded-full min-w-[70px]"
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div 
                        className="absolute inset-0 rounded-full transition-all duration-200"
                        style={{ backgroundColor: '#00c2ff20' }}
                      />
                    )}
                    
                    {/* Icon */}
                    <div className="relative z-10">
                      <Icon 
                        className="w-5 h-5 transition-all duration-200" 
                        style={{ 
                          color: isActive ? '#00c2ff' : '#ffffff50',
                          strokeWidth: isActive ? 2.5 : 2
                        }}
                        fill={isActive ? '#00c2ff20' : 'none'}
                      />
                    </div>
                    
                    {/* Label */}
                    <span 
                      className="text-[10px] transition-all duration-200 relative z-10 whitespace-nowrap"
                      style={{ 
                        color: isActive ? '#00c2ff' : '#ffffff50',
                        fontWeight: isActive ? 600 : 500
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Toaster richColors position="top-center" />
    </div>
  );
}
