// ============================================
// KITCHEN LEDGER - TIPOS Y DEFINICIONES
// ============================================

// Unidades de medida soportadas
export type UnidadMedida =
  | 'kg'      // Kilogramo
  | 'g'       // Gramo
  | 'l'       // Litro
  | 'ml'      // Mililitro
  | 'pieza'   // Pieza/unidad
  | 'docena'  // Docena
  | 'lb'      // Libra
  | 'oz'      // Onza
  | 'gal'     // Galón
  | 'taza'    // Taza
  | 'cda'     // Cucharada
  | 'cdt';    // Cucharadita

// Unidad con su factor de conversión a la unidad base
export interface UnidadConversion {
  id: UnidadMedida;
  nombre: string;
  nombrePlural: string;
  factorConversion: number; // Factor para convertir a la unidad base
  unidadBase: UnidadMedida;
}

// Ingrediente en la base de datos
export interface Ingrediente {
  id: string;
  nombre: string;
  unidadCompra: UnidadMedida;
  costoUnitario: number; // Costo por unidad de compra
  categoria: string;
  proveedor?: string;
  fechaActualizacion: string;
  activo: boolean;
  densidad?: number; // Para conversiones peso/volumen
}

// Fase 2: Pasos de Receta
export interface PasoReceta {
  titulo: string;
  descripcion: string;
  imagen?: string;
  tiempoEstimado?: number; // minutos
}

// Ingrediente dentro de una receta (link)
export interface IngredienteReceta {
  id: string;
  ingredienteId?: string; // Opcional si es sub-receta
  subRecetaId?: string;   // [NEW] Fase 2
  nombreIngrediente?: string; // O nombre de sub-receta
  cantidad: number;
  unidadUso: UnidadMedida;
  // Campos calculados
  costoCalculado: number;
}

// Receta completa
export interface Receta {
  id: string;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  porciones: number;
  tiempoPreparacion?: number; // en minutos
  categoria: string;
  ingredientes: IngredienteReceta[];
  pasos?: PasoReceta[]; // [NEW] Fase 2
  costoTotal: number;
  precioVenta: number;
  margenGanancia: number;
  activa: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Indicador de rentabilidad (semáforo)
export type IndicadorRentabilidad = 'verde' | 'amarillo' | 'rojo';

// Vista actual de la aplicación
export type Vista = 'dashboard' | 'insumos' | 'recetas' | 'nueva-receta' | 'editar-receta' | 'produccion';

// Rol del usuario
export type RolUsuario = 'contador' | 'chef' | 'admin';

// Fase 4: Producción y Reportes
export type TipoMovimiento = 'COMPRA' | 'MERMA' | 'AJUSTE';

export interface MovimientoInventario {
  id: string;
  fecha: string;
  tipo: TipoMovimiento;
  ingredienteId: string;
  nombreIngrediente?: string; // Join
  cantidad: number;
  unidadMedida: string;
  costoUnitarioSnapshot: number;
  costoTotal: number;
  motivo?: string;
}

export interface RegistroProduccion {
  id: string;
  fecha: string;
  recetaId: string;
  nombreReceta?: string; // Join
  cantidadProducida: number;
  costoUnitarioSnapshot: number;
  costoTotal: number;
}

// ============================================
// CONSTANTES DE CONVERSIÓN
// ============================================

export const UNIDADES: Record<UnidadMedida, UnidadConversion> = {
  kg: {
    id: 'kg',
    nombre: 'Kilogramo',
    nombrePlural: 'Kilogramos',
    factorConversion: 1,
    unidadBase: 'kg'
  },
  g: {
    id: 'g',
    nombre: 'Gramo',
    nombrePlural: 'Gramos',
    factorConversion: 0.001,
    unidadBase: 'kg'
  },
  l: {
    id: 'l',
    nombre: 'Litro',
    nombrePlural: 'Litros',
    factorConversion: 1,
    unidadBase: 'l'
  },
  ml: {
    id: 'ml',
    nombre: 'Mililitro',
    nombrePlural: 'Mililitros',
    factorConversion: 0.001,
    unidadBase: 'l'
  },
  pieza: {
    id: 'pieza',
    nombre: 'Pieza',
    nombrePlural: 'Piezas',
    factorConversion: 1,
    unidadBase: 'pieza'
  },
  docena: {
    id: 'docena',
    nombre: 'Docena',
    nombrePlural: 'Docenas',
    factorConversion: 12,
    unidadBase: 'pieza'
  },
  lb: {
    id: 'lb',
    nombre: 'Libra',
    nombrePlural: 'Libras',
    factorConversion: 0.453592,
    unidadBase: 'kg'
  },
  oz: {
    id: 'oz',
    nombre: 'Onza',
    nombrePlural: 'Onzas',
    factorConversion: 0.0283495,
    unidadBase: 'kg'
  },
  gal: {
    id: 'gal',
    nombre: 'Galón',
    nombrePlural: 'Galones',
    factorConversion: 3.78541,
    unidadBase: 'l'
  },
  taza: {
    id: 'taza',
    nombre: 'Taza',
    nombrePlural: 'Tazas',
    factorConversion: 0.24,
    unidadBase: 'l'
  },
  cda: {
    id: 'cda',
    nombre: 'Cucharada',
    nombrePlural: 'Cucharadas',
    factorConversion: 0.015,
    unidadBase: 'l'
  },
  cdt: {
    id: 'cdt',
    nombre: 'Cucharadita',
    nombrePlural: 'Cucharaditas',
    factorConversion: 0.005,
    unidadBase: 'l'
  }
};

// Categorías predefinidas
export const CATEGORIAS_INGREDIENTES = [
  'Carnes',
  'Pescados',
  'Mariscos',
  'Vegetales',
  'Frutas',
  'Lácteos',
  'Huevos',
  'Granos',
  'Pastas',
  'Especias',
  'Aceites',
  'Condimentos',
  'Bebidas',
  'Panadería',
  'Otros'
];

export const CATEGORIAS_RECETAS = [
  'Entradas',
  'Sopas',
  'Ensaladas',
  'Platos Fuertes',
  'Postres',
  'Bebidas',
  'Especiales',
  'Menú del Día'
];

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

// Convertir cantidad de una unidad a otra
export function convertirUnidad(
  cantidad: number,
  desde: UnidadMedida,
  hacia: UnidadMedida,
  densidad: number = 1 // g/ml
): number {
  const unidadDesde = UNIDADES[desde];
  const unidadHacia = UNIDADES[hacia];

  // Caso 1: Misma unidad base (Peso -> Peso, Volumen -> Volumen)
  if (unidadDesde.unidadBase === unidadHacia.unidadBase) {
    const cantidadBase = cantidad * unidadDesde.factorConversion;
    return cantidadBase / unidadHacia.factorConversion;
  }

  // Caso 2: Conversión Cruzada (Peso <-> Volumen)
  const esPesoDesde = unidadDesde.unidadBase === 'kg';
  const esVolumenDesde = unidadDesde.unidadBase === 'l';

  if (esPesoDesde && unidadHacia.unidadBase === 'l') { // Kg -> Litros
    // 1. Convertir a gramos (Peso base de cálculo)
    const gramos = cantidad * unidadDesde.factorConversion * 1000;
    // 2. Convertir a ml usando densidad (v = m / d)
    const mililitros = gramos / densidad;
    // 3. Convertir a unidad destino (Litros base)
    const litros = mililitros / 1000;
    return litros / unidadHacia.factorConversion;
  }

  if (esVolumenDesde && unidadHacia.unidadBase === 'kg') { // Litros -> Kg
    // 1. Convertir a mililitros (Volumen base de cálculo)
    const mililitros = cantidad * unidadDesde.factorConversion * 1000;
    // 2. Convertir a gramos usando densidad (m = v * d)
    const gramos = mililitros * densidad;
    // 3. Convertir a unidad destino (Kg base)
    const kilogramos = gramos / 1000;
    return kilogramos / unidadHacia.factorConversion;
  }

  // Si no es compatible (ej: Pieza -> Kg sin saber peso unitario), retornar original
  return cantidad;
}

// Calcular costo proporcional de un ingrediente en receta
export function calcularCostoProporcional(
  cantidad: number,
  unidadUso: UnidadMedida,
  unidadCompra: UnidadMedida,
  costoUnitario: number
): number {
  const cantidadEnUnidadCompra = convertirUnidad(cantidad, unidadUso, unidadCompra);
  return cantidadEnUnidadCompra * costoUnitario;
}

// Determinar indicador de rentabilidad
export function getIndicadorRentabilidad(
  costo: number,
  precioVenta: number
): IndicadorRentabilidad {
  if (precioVenta === 0) return 'rojo';
  const porcentajeCosto = (costo / precioVenta) * 100;

  if (porcentajeCosto < 30) return 'verde';
  if (porcentajeCosto <= 35) return 'amarillo';
  return 'rojo';
}

// Formatear moneda
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount);
}

// Formatear porcentaje
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Generar ID único
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
