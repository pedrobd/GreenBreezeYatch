import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("CRITICAL: Supabase Client environment variables (URL/ANON_KEY) are missing!", {
            url: !!supabaseUrl,
            key: !!supabaseAnonKey
        })
        return createBrowserClient('', '') // Return a dummy but initialized client to avoid immediate crash
    }

    return createBrowserClient(
        supabaseUrl,
        supabaseAnonKey
    )
}
