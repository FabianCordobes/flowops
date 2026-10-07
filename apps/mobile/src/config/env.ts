const getRequiredEnv = (value: string | undefined, name: string): string => {
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
  
    return value;
  };
  
  export const env = {
    apiUrl: getRequiredEnv(
      process.env.EXPO_PUBLIC_API_URL,
      'EXPO_PUBLIC_API_URL',
    ).replace(/\/$/, ''),
  
    supabaseUrl: getRequiredEnv(
      process.env.EXPO_PUBLIC_SUPABASE_URL,
      'EXPO_PUBLIC_SUPABASE_URL',
    ),
  
    supabasePublishableKey: getRequiredEnv(
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    ),
  } as const;