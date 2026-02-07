
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL || 'https://rxealdraiawotucbymvx.supabase.co'
const key = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Ysa1Mix24BbSOWkrH-I7Og_pQu89rDk'

console.log('--- Verifying Schema V2 (Chef Pro Features) ---')
const supabase = createClient(url, key)

async function verifySchema() {
    try {
        // 1. Check 'recetas' for 'pasos' column
        // We do this by inserting a dummy row with 'pasos' and checking if it errors
        // OR simpler: select limit 1 and check struct, but if empty table...
        // Safest: Introspection is hard with client. We'll try to select 'pasos' from recipes.

        const { data, error } = await supabase
            .from('recetas')
            .select('id, pasos')
            .limit(1);

        if (error) {
            console.error('❌ Check Failed (pasos):', error.message);
        } else {
            console.log('✅ Column "pasos" detected in "recetas".');
        }

        // 2. Check 'receta_ingredientes' for 'sub_receta_id'
        const { data: riData, error: riError } = await supabase
            .from('receta_ingredientes')
            .select('id, sub_receta_id')
            .limit(1);

        if (riError) {
            console.error('❌ Check Failed (sub_receta_id):', riError.message);
        } else {
            console.log('✅ Column "sub_receta_id" detected in "receta_ingredientes".');
        }

    } catch (err) {
        console.error('❌ Unexpected Error:', err);
    }
}

verifySchema();
