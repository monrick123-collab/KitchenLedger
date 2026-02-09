-- ==========================================
-- MIGRACIÓN V5: SOPORTE PARA MERMAS Y VENTAS
-- ==========================================

-- 1. Modificar tabla historial_produccion para ser más genérica
-- Agregamos campo 'tipo' para distinguir entre:
-- 'PRODUCCION': Lo que se cocina (ya existe)
-- 'MERMA': Desperdicio registrado
-- 'VENTA': Platillo vendido/servido

ALTER TABLE historial_produccion 
ADD COLUMN tipo VARCHAR(20) DEFAULT 'PRODUCCION';

-- Agregamos campo 'motivo' para mermas (ej: "Quemado", "Caída", "Caducado")
ALTER TABLE historial_produccion
ADD COLUMN motivo TEXT;

-- Agregamos índice para búsquedas rápidas por tipo
CREATE INDEX idx_historial_tipo ON historial_produccion(tipo);

-- Comentarios para documentación
COMMENT ON COLUMN historial_produccion.tipo IS 'Tipo de registro: PRODUCCION, MERMA, VENTA';
COMMENT ON COLUMN historial_produccion.motivo IS 'Razón de la merma o detalle adicional';

-- ==========================================
-- NOTA: No necesitamos crear tablas nuevas, 
-- reutilizamos la estructura existente para 
-- mantener todo el historial unificado.
-- ==========================================
