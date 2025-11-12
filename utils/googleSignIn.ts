import { Platform } from 'react-native';
import { GoogleSigninType } from './googleSignin.types';

let GoogleSignin: GoogleSigninType;

if (Platform.OS === 'web') {
  GoogleSignin = require('./googleSignIn.web').GoogleSignin;
} else {
  try {
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  } catch (e) {
    console.warn('RNGoogleSignin not available (expected in Expo Go)');
    GoogleSignin = {
      configure: () => {},
      hasPlayServices: async () => false,
      signIn: async () => ({ data: { idToken: null } }),
    } as any;
  }
}

export { GoogleSignin };