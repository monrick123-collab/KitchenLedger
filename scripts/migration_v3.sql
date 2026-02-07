-- MIGRACIÓN FASE 3: CONVERSIÓN DE UNIDADES AVANZADA

-- 1. Agregar columna de densidad a la tabla de insumos
-- Valor por defecto 1 (equivalente al agua: 1g = 1ml)
ALTER TABLE insumos 
ADD COLUMN IF NOT EXISTS densidad NUMERIC DEFAULT 1;

-- 2. Agregar columna para identificar si es un líquido (opcional, ayuda UI)
ALTER TABLE insumos 
ADD COLUMN IF NOT EXISTS es_liquido BOOLEAN DEFAULT FALSE;

-- 3. Comentarios para documentación
COMMENT ON COLUMN insumos.densidad IS 'Densidad en g/ml. Usado para convertir entre Peso y Volumen.';
