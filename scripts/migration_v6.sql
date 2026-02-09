-- ==========================================
-- MIGRACIÓN V6: TIPOS DE RECETA Y SUB-RECETA
-- ==========================================

-- 1. Agregar columna 'tipo' a tabla 'recetas'
-- Valores: 'PLATO' (Default) | 'PREPARACION' (Sub-receta / Base)

ALTER TABLE recetas 
ADD COLUMN tipo VARCHAR(20) DEFAULT 'PLATO';

-- Agregamos índice para filtrado rápido
CREATE INDEX idx_recetas_tipo ON recetas(tipo);

-- Comentarios
COMMENT ON COLUMN recetas.tipo IS 'PLATO: Receta final de venta. PREPARACION: Sub-receta o base (ej: Salsa)';

-- (Opcional) Actualizar recetas existentes que sabemos que son sub-recetas si quisiéramos,
-- pero mejor dejar que el usuario las clasifique manualmente.
