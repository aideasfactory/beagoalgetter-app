export interface GoogleSigninType {
  configure: (options: {
    scopes: string[];
    webClientId?: string;
    iosClientId?: string;
  }) => void;
  hasPlayServices: (options?: { showPlayServicesUpdateDialog?: boolean }) => Promise<boolean>;
  signIn: () => Promise<{
    data: {
      idToken: string | null;
      serverAuthCode: string | null;
      scopes: string[];
      user: {
        email: string;
        id: string;
        givenName: string | null;
        familyName: string | null;
        photo: string | null;
        name: string | null;
      };
    }
  }>;
}