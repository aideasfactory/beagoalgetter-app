import { GoogleSigninType } from './googleSignin.types';

export const GoogleSignin: GoogleSigninType = {
  configure: () => {},
  hasPlayServices: async () => true,
  signIn: async () => {
    throw new Error('Google Sign-In not implemented for web');
  },
};