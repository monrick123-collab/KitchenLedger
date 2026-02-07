export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            insumos: {
                Row: {
                    id: string
                    nombre: string
                    categoria: string
                    unidad_compra: string
                    costo_unitario: number
                    proveedor: string | null
                    fecha_actualizacion: string
                    user_id: string | null
                }
                Insert: {
                    id?: string
                    nombre: string
                    categoria: string
                    unidad_compra: string
                    costo_unitario: number
                    proveedor?: string | null
                    fecha_actualizacion?: string
                    user_id?: string | null
                }
                Update: {
                    id?: string
                    nombre?: string
                    categoria?: string
                    unidad_compra?: string
                    costo_unitario?: number
                    proveedor?: string | null
                    fecha_actualizacion?: string
                    user_id?: string | null
                }
            }
            recetas: {
                Row: {
                    id: string
                    nombre: string
                    descripcion: string | null
                    categoria: string
                    tiempo_preparacion: number
                    porciones: number
                    precio_venta: number
                    imagen: string | null
                    activa: boolean
                    fecha_creacion: string
                    fecha_actualizacion: string
                    user_id: string | null
                    pasos: any | null // JSONB
                }
                Insert: {
                    id?: string
                    nombre: string
                    descripcion?: string | null
                    categoria: string
                    tiempo_preparacion: number
                    porciones: number
                    precio_venta: number
                    imagen?: string | null
                    activa?: boolean
                    fecha_creacion?: string
                    fecha_actualizacion?: string
                    user_id?: string | null
                    pasos?: any | null
                }
                Update: {
                    id?: string
                    nombre?: string
                    descripcion?: string | null
                    categoria?: string
                    tiempo_preparacion?: number
                    porciones?: number
                    precio_venta?: number
                    imagen?: string | null
                    activa?: boolean
                    fecha_creacion?: string
                    fecha_actualizacion?: string
                    user_id?: string | null
                    pasos?: any | null
                }
            }
            receta_ingredientes: {
                Row: {
                    id: string
                    receta_id: string
                    ingrediente_id: string
                    sub_receta_id: string | null // [NEW]
                    cantidad: number
                    unidad_uso: string
                    costo_calculado: number
                }
                Insert: {
                    id?: string
                    receta_id: string
                    ingrediente_id?: string | null
                    sub_receta_id?: string | null // [NEW]
                    cantidad: number
                    unidad_uso: string
                    costo_calculado: number
                }
                Update: {
                    id?: string
                    receta_id?: string
                    ingrediente_id?: string | null
                    sub_receta_id?: string | null // [NEW]
                    cantidad?: number
                    unidad_uso?: string
                    costo_calculado?: number
                }
            }
            historial_produccion: {
                Row: {
                    id: string
                    fecha: string
                    receta_id: string
                    cantidad_producida: number
                    costo_unitario_snapshot: number
                    costo_total: number
                    usuario_id: string | null
                }
                Insert: {
                    id?: string
                    fecha?: string
                    receta_id: string
                    cantidad_producida: number
                    costo_unitario_snapshot: number
                    costo_total: number
                    usuario_id?: string | null
                }
                Update: {
                    id?: string
                    fecha?: string
                    receta_id?: string
                    cantidad_producida?: number
                    costo_unitario_snapshot?: number
                    costo_total?: number
                    usuario_id?: string | null
                }
            }
            movimientos_inventario: {
                Row: {
                    id: string
                    fecha: string
                    tipo: 'COMPRA' | 'MERMA' | 'AJUSTE'
                    ingrediente_id: string
                    cantidad: number
                    unidad_medida: string
                    costo_unitario_snapshot: number
                    costo_total: number
                    motivo: string | null
                    usuario_id: string | null
                }
                Insert: {
                    id?: string
                    fecha?: string
                    tipo: 'COMPRA' | 'MERMA' | 'AJUSTE'
                    ingrediente_id: string
                    cantidad: number
                    unidad_medida: string
                    costo_unitario_snapshot: number
                    costo_total: number
                    motivo?: string | null
                    usuario_id?: string | null
                }
                Update: {
                    id?: string
                    fecha?: string
                    tipo: 'COMPRA' | 'MERMA' | 'AJUSTE'
                    ingrediente_id?: string
                    cantidad?: number
                    unidad_medida?: string
                    costo_unitario_snapshot?: number
                    costo_total?: number
                    motivo?: string | null
                    usuario_id?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
