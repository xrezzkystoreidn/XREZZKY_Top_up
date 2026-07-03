// ============================================================
// SUPABASE CONFIG
// ============================================================

// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Environment variables (Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                    window._env_?.VITE_SUPABASE_URL ||
                    process.env.VITE_SUPABASE_URL

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                         window._env_?.VITE_SUPABASE_ANON_KEY ||
                         process.env.VITE_SUPABASE_ANON_KEY

// Validate
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase credentials missing!')
    console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

// Create client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check connection
export const checkConnection = async () => {
    try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
        if (error) throw error
        console.log('✅ Supabase connected!')
        return true
    } catch (error) {
        console.error('❌ Supabase connection failed:', error.message)
        return false
    }
}

export default supabase