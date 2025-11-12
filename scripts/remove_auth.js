/* eslint-disable */
const fs = require('fs');
const path = require('path');

// Files and directories to remove
const filesToRemove = [
  'app/confirm.tsx',
  'app/forgot-password.tsx',
  'app/initial.tsx',
  'app/login.tsx',
  'app/magic-link.tsx',
  'app/signup.tsx',
  'app/(tabs)/profile',
  'components/SocialIcons.tsx',
  'utils/googleSignIn.ts',
  'utils/googleSignIn.web.ts',
  'utils/googleSignin.types.ts',
];

// Function to remove files and directories
function removeFiles() {
  console.log('🗑️  Removing auth-related files...');
  
  filesToRemove.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      if (fs.lstatSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✅ Removed directory: ${filePath}`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`✅ Removed file: ${filePath}`);
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  });
}

// Function to update auth context
function updateAuthContext() {
  console.log('🔧 Updating auth context...');
  
  const authContextPath = path.join(__dirname, '..', 'context', 'auth.tsx');
  const newAuthContext = `import React from 'react';
import { useHasLaunched, useStorageState } from '../hooks';
import { router } from 'expo-router';

const AuthContext = React.createContext<{
  signInWithSkip: () => void;
  session: string | null;
  setSession: (session: [string | null, any | null]) => void;
  hasLaunched: boolean;
  setHasLaunched: (value: boolean) => void;
  user: any | null;
  isLoading: boolean;
}>({
  signInWithSkip: () => null,
  session: null,
  setSession: () => { },
  hasLaunched: false,
  setHasLaunched: () => {},
  user: null,
  isLoading: false,
});

export function useSession() {
  const value = React.useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }
  return value;
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, session, user], setSession] = useStorageState<string, any>('session', [null, null]);
  const [hasLaunched, setHasLaunched] = useHasLaunched();

  const signInWithSkip = async () => {
    setSession(['randomToken123', {
      id: '123',
      email: 'test@test.com',
      user_metadata: {
        name: 'Test User',
      },
    }]);
    router.navigate('/(tabs)');
  }

  return (
    <AuthContext.Provider
      value={{
        signInWithSkip,
        session,
        setSession,
        hasLaunched,
        setHasLaunched,
        user,
        isLoading,
      }}>
      {props.children}
    </AuthContext.Provider>
  );
}
`;

  fs.writeFileSync(authContextPath, newAuthContext);
  console.log('✅ Updated auth context');
}

// Function to update onboarding page
function updateOnboarding() {
  console.log('🔧 Updating onboarding page...');
  
  const onboardingPath = path.join(__dirname, '..', 'app', 'onboarding.tsx');
  const newOnboarding = `import React from 'react';
import { router } from 'expo-router';
import { Onboarding } from '@/components';
import { useSession } from '@/context';

const OnboardingScreen = () => {
  const { setHasLaunched, signInWithSkip } = useSession();

  const finishOnboarding = async () => {
    try {
      setHasLaunched(true);
      await signInWithSkip();
    } catch (error) {
      await signInWithSkip();
    }
  };

  return (
    <Onboarding onFinishOnboarding={finishOnboarding} />
  );
};

export default OnboardingScreen;
`;

  fs.writeFileSync(onboardingPath, newOnboarding);
  console.log('✅ Updated onboarding page');
}

// Function to update root layout
function updateRootLayout() {
  console.log('🔧 Updating root layout...');
  
  const layoutPath = path.join(__dirname, '..', 'app', '_layout.tsx');
  const newLayoutContent = `import { SessionProvider, useSession } from '@/context';
import Settings from '@/Settings';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Sentry from '@sentry/react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import Superwall from "expo-superwall/compat";
import { useEffect, useState } from 'react';
import { LogBox, Platform } from 'react-native';
import "../global.css";
import { LoadingScreen } from '@/components';
import i18n from '../i18n';
import { I18nextProvider } from 'react-i18next';

export {
  ErrorBoundary
} from 'expo-router';

export default function Root() {

  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    const init = async () => {
      try {
        if (Platform.OS !== 'web') {
          Superwall.configure({
            apiKey:
              Platform.select({
                ios: Settings.Superwall.iOSApiKey,
                android: Settings.Superwall.AndroidApiKey,
              }) || '',
          });
        }

        if (fontsLoaded) {
          Sentry.init({
            dsn: process.env.SENTRY_DSN,
            debug: true,
          });
        }
      } catch {
        console.log('error')
      }
    };

    init();
    LogBox.ignoreAllLogs();
  }, [fontsLoaded]);


  return (
    <I18nextProvider i18n={i18n}>
      <SessionProvider>
        <RootNavigator />
      </SessionProvider>
    </I18nextProvider>
  );
}


function RootNavigator() {
  const { session, hasLaunched, isLoading } = useSession();
  const [initialLoaded, setInitialLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoaded(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const shouldShowOnboarding = !hasLaunched || Settings.ALWAYS_SHOW_ONBOARDING;
  const shouldShowApp = hasLaunched

  const shouldShowLoading = isLoading || !initialLoaded

  if (shouldShowLoading) return <LoadingScreen />

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={shouldShowOnboarding}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>

      <Stack.Protected guard={shouldShowApp}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}`;
  
  fs.writeFileSync(layoutPath, newLayoutContent);
  console.log('✅ Updated root layout');
}

// Function to update components index
function updateComponentsIndex() {
  console.log('🔧 Updating components index...');
  
  const componentsIndexPath = path.join(__dirname, '..', 'components', 'index.ts');
  let indexContent = fs.readFileSync(componentsIndexPath, 'utf8');
  
  // Remove SocialIcons export
  indexContent = indexContent.replace(/export \* from '\.\/SocialIcons'/, '');
  
  fs.writeFileSync(componentsIndexPath, indexContent);
  console.log('✅ Updated components index');
}

// Function to update utils index
function updateUtilsIndex() {
  console.log('🔧 Updating utils index...');
  
  const utilsIndexPath = path.join(__dirname, '..', 'utils', 'index.ts');
  const newUtilsIndex = `// Utils exports will be added here as needed`;
  
  fs.writeFileSync(utilsIndexPath, newUtilsIndex);
  console.log('✅ Updated utils index');
}

// Function to update tabs layout
function updateTabsLayout() {
  console.log('🔧 Updating tabs layout...');
  
  const tabsLayoutPath = path.join(__dirname, '..', 'app', '(tabs)', '_layout.tsx');
  const newTabsLayout = `import { Redirect, SplashScreen, Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Notifications from 'expo-notifications';
import { useSession } from '@/context';
import { useNotifications } from '@/hooks';
import { useTranslation } from 'react-i18next';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function TabLayout() {
  useNotifications();
  const { t } = useTranslation();

  return (
    <Tabs 
      screenOptions={{ tabBarActiveTintColor: 'blue', headerShown: true, }} 
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('aiChat'),
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="magic" color={color} />,
        }}
      />
      <Tabs.Screen
        name="image_generation"
        options={{
          title: t('aiImage'),
          headerShown: false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="image" color={color} />,
        }}
      />
      <Tabs.Screen
        name="components"
        options={{
          title: t('components'),
          headerShown: false,
          headerTitle: t('components'),
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="book" color={color} />,
        }}
      />
    </Tabs>
  );
}`;
  
  fs.writeFileSync(tabsLayoutPath, newTabsLayout);
  console.log('✅ Updated tabs layout');
}

// Function to update package.json
function updatePackageJson() {
  console.log('🔧 Updating package.json...');
  
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Remove auth-related dependencies
  const dependenciesToRemove = [
    'expo-apple-authentication',
    '@react-native-google-signin/google-signin'
  ];
  
  dependenciesToRemove.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      delete packageJson.dependencies[dep];
      console.log(`✅ Removed dependency: ${dep}`);
    }
  });
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json');
}

// Function to update app.json
function updateAppJson() {
  console.log('🔧 Updating app.json...');
  
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  // Remove auth-related plugins
  const pluginsToRemove = [
    '@react-native-google-signin/google-signin',
    'expo-apple-authentication'
  ];
  
  if (appJson.expo && appJson.expo.plugins) {
    appJson.expo.plugins = appJson.expo.plugins.filter(plugin => {
      if (Array.isArray(plugin)) {
        return !pluginsToRemove.includes(plugin[0]);
      }
      return !pluginsToRemove.includes(plugin);
    });
    
    console.log('✅ Removed auth-related plugins from app.json');
  }
  
  // Remove usesAppleSignIn from iOS config
  if (appJson.expo && appJson.expo.ios && appJson.expo.ios.usesAppleSignIn) {
    delete appJson.expo.ios.usesAppleSignIn;
    console.log('✅ Removed usesAppleSignIn from iOS config');
  }
  
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  console.log('✅ Updated app.json');
}

// Main execution
function main() {
  console.log('🚀 Starting auth removal process...\n');
  
  try {
    removeFiles();
    updateAuthContext();
    updateOnboarding();
    updateRootLayout();
    updateComponentsIndex();
    updateUtilsIndex();
    updateTabsLayout();
    updatePackageJson();
    updateAppJson();
    
    console.log('\n✅ Auth removal completed successfully!');
    console.log('\n📝 Summary of changes:');
    console.log('   • Removed auth-related pages (confirm, forgot-password, initial, login, magic-link, signup)');
    console.log('   • Removed profile tab and its pages');
    console.log('   • Removed SocialIcons component');
    console.log('   • Removed Google Sign-In utils files (googleSignIn.ts, googleSignIn.web.ts, googleSignin.types.ts)');
    console.log('   • Simplified auth context to only include signInWithSkip');
    console.log('   • Updated onboarding to redirect directly to tabs');
    console.log('   • Updated root layout to remove auth flow');
    console.log('   • Removed Google Sign-In configuration');
    console.log('   • Removed auth-related dependencies from package.json');
    console.log('   • Removed auth-related plugins from app.json');
    console.log('   • Removed usesAppleSignIn from iOS config');
    console.log('   • Updated utils index to remove Google Sign-In exports');
    console.log('\n🎉 Your app is now auth-free!');
    console.log('\n💡 Don\'t forget to run: npm install (or bun install) to update dependencies');
    
  } catch (error) {
    console.error('❌ Error during auth removal:', error);
    process.exit(1);
  }
}

main();
