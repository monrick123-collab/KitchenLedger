
import { createClient } from '@supabase/supabase-js'

// WARNING: Using env vars if available, else hardcoded for this test script context 
// (In a real scenario we'd load dotenv, but here we can reuse the known values for the script)
const url = process.env.VITE_SUPABASE_URL || 'https://rxealdraiawotucbymvx.supabase.co'
const key = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Ysa1Mix24BbSOWkrH-I7Og_pQu89rDk'

console.log('--- Database Functional Validation (CRUD) ---')
const supabase = createClient(url, key)

async function validateCRUD() {
    const testId = 'test-validation-' + Date.now();
    const testIngrediente = {
        nombre: 'INGREDIENTE PRUEBA ' + Date.now(),
        categoria: 'Pruebas',
        unidad_compra: 'kg',
        costo_unitario: 10,
        proveedor: 'Tester Boot'
    };

    try {
        // 1. CREATE
        console.log('[1/4] Testing INSERT (Insumos)...');
        const { data: inserted, error: insertError } = await supabase
            .from('insumos')
            .insert(testIngrediente)
            .select()
            .single();

        if (insertError) throw new Error(`Insert failed: ${insertError.message}`);
        console.log('    ✅ Success. ID:', inserted.id);

        // 2. READ
        console.log('[2/4] Testing SELECT...');
        const { data: read, error: readError } = await supabase
            .from('insumos')
            .select('*')
            .eq('id', inserted.id)
            .single();

        if (readError) throw new Error(`Read failed: ${readError.message}`);
        if (read.nombre !== testIngrediente.nombre) throw new Error('Data mismatch');
        console.log('    ✅ Success. Verified data integrity.');

        // 3. UPDATE
        console.log('[3/4] Testing UPDATE...');
        const { error: updateError } = await supabase
            .from('insumos')
            .update({ costo_unitario: 20 })
            .eq('id', inserted.id);

        if (updateError) throw new Error(`Update failed: ${updateError.message}`);
        console.log('    ✅ Success.');

        // 4. DELETE
        console.log('[4/4] Testing DELETE...');
        const { error: deleteError } = await supabase
            .from('insumos')
            .delete()
            .eq('id', inserted.id);

        if (deleteError) throw new Error(`Delete failed: ${deleteError.message}`);
        console.log('    ✅ Success.');

        console.log('\n✨ ALL SYSTEMS OPERATIONAL. Database is fully read/write accessible.');

    } catch (err) {
        console.error('\n❌ VALIDATION FAILED:', err.message);
        process.exit(1);
    }
}

validateCRUD();
