export function hasSupabasePublicEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabasePublicEnvStatus() {
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return {
    isReady: hasUrl && hasAnonKey,
    missing: [
      !hasUrl ? "NEXT_PUBLIC_SUPABASE_URL" : "",
      !hasAnonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : "",
    ].filter(Boolean),
  };
}
