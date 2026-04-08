import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If variables are missing, return a dummy client to avoid crashing the build or initialization
    if (!supabaseUrl || !supabaseAnonKey) {
        return createBrowserClient("https://placeholder.supabase.co", "placeholder")
    }

    return createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    )
}
