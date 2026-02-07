
import { createClient } from '@supabase/supabase-js'

// WARNING: These credentials are READ ONLY from the file system for validation purposes.
// They are not hardcoded in the codebase for production use.
const url = 'https://rxealdraiawotucbymvx.supabase.co'
// User provided key - suspected to be opaque or incorrect if checks fail
const key = 'sb_publishable_Ysa1Mix24BbSOWkrH-I7Og_pQu89rDk'

console.log('--- Supabase Connection Tester ---')
console.log('URL:', url)
console.log('Key (masked):', key.substring(0, 15) + '...')

const supabase = createClient(url, key)

async function testConnection() {
    try {
        const start = Date.now()
        // Try a simple select. 
        // If the table 'insumos' doesn't exist yet, this will error with code 42P01 (relation does not exist)
        // If auth is wrong, it will error with 401 or similar.
        const { data, error, count } = await supabase
            .from('insumos')
            .select('*', { count: 'exact', head: true })

        const ms = Date.now() - start

        if (error) {
            console.error('\n[!] Connection Attempt FAILED')
            console.error('Error Code:', error.code)
            console.error('Error Message:', error.message)

            if (error.code === 'PGRST301') {
                console.log('\nHint: JWT/Key seems invalid or expired. "sb_publishable_" usually indicates an opaque key, not a standard Supabase Anon JWT.')
            } else if (error.code === '42P01') { // relation does not exist
                console.log('\n[+] Connection Established! (But table missing)')
                console.log('Reason: The database is reachable, but the table "insumos" does not exist yet.')
                console.log('Action: Proceed to run the SQL script provided earlier.')
                return;
            }
        } else {
            console.log(`\n[+] Connection SUCCESSFUL in ${ms}ms`)
            console.log(`Table exists. Row count: ${count}`)
        }
    } catch (err) {
        console.error('\n[!] CRITICAL ERROR:', err)
    }
}

testConnection()
