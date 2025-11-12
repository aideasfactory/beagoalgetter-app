declare namespace NodeJS {
  interface ProcessEnv {
    SENTRY_DSN: string;
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: string;
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: string; 
    EXPO_PUBLIC_EXPO_PROJECT_ID: string;
    EXPO_PUBLIC_SUPABASE_URL: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
  }
}
