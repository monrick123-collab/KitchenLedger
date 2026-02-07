
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySchema() {
    console.log('🔍 Verificando esquema de base de datos...');

    // 1. Verificar Tabla Insumos y columna Densidad (Fase 3)
    const { data: insumos, error: errorInsumos } = await supabase
        .from('insumos')
        .select('densidad, es_liquido')
        .limit(1);

    if (errorInsumos) {
        if (errorInsumos.code === '42703') { // Undefined column
            console.error('❌ FALTAN COLUMNAS FASE 3: "densidad" o "es_liquido" en tabla "insumos".');
            console.error('   -> Ejecuta el SQL de la Fase 3.');
        } else if (errorInsumos.code === '42P01') { // Undefined table
            console.error('❌ FALTA TABLA: La tabla "insumos" no existe.');
        } else {
            console.error('❌ Error verificando insumos:', errorInsumos.message);
        }
    } else {
        console.log('✅ Fase 3 (Conversiones): Columnas en "insumos" detectadas correctamente.');
    }

    // 2. Verificar Tabla Recetas y columna Pasos (Fase 2)
    const { data: recetas, error: errorRecetas } = await supabase
        .from('recetas')
        .select('pasos')
        .limit(1);

    if (errorRecetas) {
        if (errorRecetas.code === '42703') {
            console.error('❌ FALTAN COLUMNAS FASE 2: "pasos" en tabla "recetas".');
        } else {
            console.error('❌ Error verificando recetas:', errorRecetas.message);
        }
    } else {
        console.log('✅ Fase 2 (Modo Chef): Columna "pasos" detectada.');
    }

    // 3. Verificar Tabla Receta_Ingredientes y columna Sub_Receta (Fase 2)
    const { data: ri, error: errorRI } = await supabase
        .from('receta_ingredientes')
        .select('sub_receta_id')
        .limit(1);

    if (errorRI) {
        if (errorRI.code === '42703') {
            console.error('❌ FALTAN COLUMNAS FASE 2: "sub_receta_id" en tabla "receta_ingredientes".');
        } else {
            console.error('❌ Error verificando receta_ingredientes:', errorRI.message);
        }
    } else {
        console.log('✅ Fase 2 (Sub-Recetas): Columna "sub_receta_id" detectada.');
    }
}

verifySchema();
