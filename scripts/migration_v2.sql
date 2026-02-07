-- MIGRATION V2: Chef Pro Features

-- 1. Sub-Recetas
-- Permitir que un ingrediente sea, en realidad, otra receta.
ALTER TABLE receta_ingredientes 
ADD COLUMN sub_receta_id UUID REFERENCES recetas(id);

-- Restricción opcional para asegurar integridad (solo uno de los dos debe estar lleno)
-- ALTER TABLE receta_ingredientes
-- ADD CONSTRAINT check_ingrediente_or_subreceta 
-- CHECK (
--   (ingrediente_id IS NOT NULL AND sub_receta_id IS NULL) OR 
--   (ingrediente_id IS NULL AND sub_receta_id IS NOT NULL)
-- );

-- 2. Pasos de Preparación vs Descripción Simple
-- Agregar columna JSONB para pasos estructurados
ALTER TABLE recetas 
ADD COLUMN pasos JSONB DEFAULT '[]'::jsonb;

-- Ejemplo de estructura JSONB para 'pasos':
-- [
--   { "titulo": "Cortar", "descripcion": "Cortar cebolla", "tiempo": 5 },
--   { "titulo": "Sofreír", "descripcion": "Fuego medio", "tiempo": 10 }
-- ]
