-- MIGRATION V4: Reportes y Producción

-- 1. Tabla: Historial de Producción (Bitácora de Cocina)
-- Registra qué se cocinó, cuándo y cuánto costó (teóricamente) en ese momento.
CREATE TABLE historial_produccion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  receta_id UUID REFERENCES recetas(id) NOT NULL,
  cantidad_producida NUMERIC NOT NULL, -- Porciones
  costo_unitario_snapshot NUMERIC NOT NULL, -- Costo por porción al momento del registro
  costo_total NUMERIC NOT NULL, -- cantidad * costo_unitario
  usuario_id UUID DEFAULT auth.uid()
);

-- 2. Tabla: Movimientos de Inventario (Mermas, Compras, Ajustes)
-- Registra entradas y salidas manuales de insumos.
-- Nota: La "Producción" no inserta aquí automáticamente en esta fase, 
-- se calcula teóricamente desde historial_produccion para reportes.
CREATE TABLE movimientos_inventario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  tipo TEXT NOT NULL CHECK (tipo IN ('COMPRA', 'MERMA', 'AJUSTE')), 
  ingrediente_id UUID REFERENCES insumos(id) NOT NULL,
  cantidad NUMERIC NOT NULL, -- Cantidad en la unidad de compra del ingrediente
  unidad_medida TEXT NOT NULL, -- Para referencia (debe coincidir con insumos.unidad_compra)
  costo_unitario_snapshot NUMERIC NOT NULL,
  costo_total NUMERIC NOT NULL,
  motivo TEXT, -- Ej: "Se cayó", "Caducó", "Compra Semanal"
  usuario_id UUID DEFAULT auth.uid()
);

-- 3. Índices para reportes rápidos
CREATE INDEX idx_historial_produccion_fecha ON historial_produccion(fecha);
CREATE INDEX idx_movimientos_inventario_fecha ON movimientos_inventario(fecha);
CREATE INDEX idx_movimientos_inventario_tipo ON movimientos_inventario(tipo);
