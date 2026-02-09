"use client"

import { useState, useEffect, useCallback } from 'react';
import type { Ingrediente, Receta, IngredienteReceta } from '@/types';
import {
  generateId,
  getIndicadorRentabilidad
} from '@/types';
import { supabase } from '@/lib/supabase';

// ============================================
// DATOS INICIALES (PARA SEEDAJE)
// ============================================

const INGREDIENTES_INICIALES: Ingrediente[] = [
  {
    id: generateId(),
    nombre: 'Aceite de Oliva',
    unidadCompra: 'l',
    costoUnitario: 85.50,
    categoria: 'Aceites',
    proveedor: 'Aceites del Sur',
    fechaActualizacion: new Date().toISOString(),
    activo: true
  },
  {
    id: generateId(),
    nombre: 'Pechuga de Pollo',
    unidadCompra: 'kg',
    costoUnitario: 95.00,
    categoria: 'Carnes',
    proveedor: 'Carnicería La Buena',
    fechaActualizacion: new Date().toISOString(),
    activo: true
  },
  {
    id: generateId(),
    nombre: 'Tomate Roma',
    unidadCompra: 'kg',
    costoUnitario: 28.50,
    categoria: 'Vegetales',
    proveedor: 'Verduras Frescas',
    fechaActualizacion: new Date().toISOString(),
    activo: true
  },
  {
    id: generateId(),
    nombre: 'Sal',
    unidadCompra: 'kg',
    costoUnitario: 15.00,
    categoria: 'Condimentos',
    proveedor: 'Especias Mundo',
    fechaActualizacion: new Date().toISOString(),
    activo: true
  }
];

// ============================================
// HOOK PRINCIPAL DE BASE DE DATOS (SUPABASE)
// ============================================

export function useDatabase() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Cargar Insumos
      const { data: dataInsumos, error: errorInsumos } = await (supabase
        .from('insumos') as any)
        .select('*')
        .order('nombre');

      if (errorInsumos) throw errorInsumos;

      const ingredientesMapeados: Ingrediente[] = (dataInsumos as any[] || []).map((i: any) => ({
        id: i.id,
        nombre: i.nombre,
        unidadCompra: i.unidad_compra as any,
        costoUnitario: Number(i.costo_unitario),
        categoria: i.categoria,
        proveedor: i.proveedor || undefined,
        fechaActualizacion: i.fecha_actualizacion,
        activo: true,
        densidad: i.densidad || 1
      }));

      setIngredientes(ingredientesMapeados);

      // 2. Cargar Recetas y sus Ingredientes
      const { data: dataRecetas, error: errorRecetas } = await (supabase
        .from('recetas') as any)
        .select(`
            *,
            receta_ingredientes!receta_ingredientes_receta_id_fkey (
                id,
                ingrediente_id,
                sub_receta_id,
                cantidad,
                unidad_uso,
                costo_calculado
            )
        `)
        .order('nombre');

      if (errorRecetas) throw errorRecetas;

      const recetasMapeadasPromises = (dataRecetas as any[] || []).map(async (r: any) => {
        const ingredientesReceta: IngredienteReceta[] = [];

        for (const ri of (r.receta_ingredientes as any[] || [])) {
          let costo = Number(ri.costo_calculado);
          let nombre = "Desconocido";

          if (ri.ingrediente_id) {
            const ingBase = ingredientesMapeados.find(i => i.id === ri.ingrediente_id);
            nombre = ingBase?.nombre || "Ingrediente Eliminado";
          } else if (ri.sub_receta_id) {
            const sub = (dataRecetas as any[] || []).find((s: any) => s.id === ri.sub_receta_id);
            nombre = sub ? `(Sub) ${sub.nombre}` : "(Sub) Desconocida";
          }

          ingredientesReceta.push({
            id: ri.id,
            ingredienteId: ri.ingrediente_id,
            subRecetaId: ri.sub_receta_id,
            cantidad: Number(ri.cantidad),
            unidadUso: ri.unidad_uso as any,
            costoCalculado: costo,
            nombreIngrediente: nombre
          });
        }

        let costoTotal = 0;
        ingredientesReceta.forEach(ir => costoTotal += ir.costoCalculado);
        const margenGanancia = r.precio_venta > 0 ? ((r.precio_venta - costoTotal) / r.precio_venta) * 100 : 0;

        return {
          id: r.id,
          nombre: r.nombre,
          descripcion: r.descripcion || '',
          categoria: r.categoria,
          tipo: r.tipo || 'PLATO', // [NEW] V6
          porciones: Number(r.porciones),
          tiempoPreparacion: r.tiempo_preparacion,
          precioVenta: Number(r.precio_venta),
          imagen: r.imagen || undefined,
          activa: r.activa !== false,
          fechaCreacion: r.fecha_creacion,
          fechaActualizacion: r.fecha_actualizacion,
          ingredientes: ingredientesReceta,
          pasos: r.pasos || [],
          costoTotal,
          margenGanancia
        };
      });

      const recetasMapeadas = await Promise.all(recetasMapeadasPromises);
      setRecetas(recetasMapeadas);

    } catch (error) {
      console.error('Error cargando datos de Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar una sola receta (Optimización)
  const recargarReceta = async (id: string) => {
    try {
      const { data: r, error } = await (supabase
        .from('recetas') as any)
        .select(`
            *,
            receta_ingredientes!receta_ingredientes_receta_id_fkey (
                id,
                ingrediente_id,
                sub_receta_id,
                cantidad,
                unidad_uso,
                costo_calculado
            )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Mapear esta receta única
      const ingredientesReceta: IngredienteReceta[] = [];
      for (const ri of (r.receta_ingredientes as any[] || [])) {
        let costo = Number(ri.costo_calculado);
        let nombre = "Desconocido";

        if (ri.ingrediente_id) {
          const ingBase = ingredientes.find(i => i.id === ri.ingrediente_id);
          nombre = ingBase?.nombre || "Ingrediente Eliminado";
        } else if (ri.sub_receta_id) {
          const sub = recetas.find(s => s.id === ri.sub_receta_id);
          nombre = sub ? `(Sub) ${sub.nombre}` : "(Sub) Desconocida";
        }

        ingredientesReceta.push({
          id: ri.id,
          ingredienteId: ri.ingrediente_id,
          subRecetaId: ri.sub_receta_id,
          cantidad: Number(ri.cantidad),
          unidadUso: ri.unidad_uso as any,
          costoCalculado: costo,
          nombreIngrediente: nombre
        });
      }

      let costoTotal = 0;
      ingredientesReceta.forEach(ir => costoTotal += ir.costoCalculado);
      const margenGanancia = r.precio_venta > 0 ? ((r.precio_venta - costoTotal) / r.precio_venta) * 100 : 0;

      const recetaProcesada: Receta = {
        id: r.id,
        nombre: r.nombre,
        descripcion: r.descripcion || '',
        categoria: r.categoria,
        tipo: r.tipo || 'PLATO', // [NEW] V6
        porciones: Number(r.porciones),
        tiempoPreparacion: r.tiempo_preparacion,
        precioVenta: Number(r.precio_venta),
        imagen: r.imagen || undefined,
        activa: r.activa !== false,
        fechaCreacion: r.fecha_creacion,
        fechaActualizacion: r.fecha_actualizacion,
        ingredientes: ingredientesReceta,
        pasos: r.pasos || [],
        costoTotal,
        margenGanancia
      };

      setRecetas(prev => {
        const index = prev.findIndex(item => item.id === id);
        if (index >= 0) {
          const newArr = [...prev];
          newArr[index] = recetaProcesada;
          return newArr;
        } else {
          return [...prev, recetaProcesada];
        }
      });
      return recetaProcesada;

    } catch (e) {
      console.error("Error recargando receta:", e);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // ============================================
  // OPERACIONES
  // ============================================

  const agregarIngrediente = async (ingrediente: Omit<Ingrediente, 'id' | 'fechaActualizacion'>) => {
    try {
      const { data, error } = await (supabase
        .from('insumos') as any)
        .insert({
          nombre: ingrediente.nombre,
          categoria: ingrediente.categoria,
          unidad_compra: ingrediente.unidadCompra,
          costo_unitario: ingrediente.costoUnitario,
          proveedor: ingrediente.proveedor,
          densidad: ingrediente.densidad
        })
        .select()
        .single();

      if (error) throw error;
      await cargarDatos();
      return data;
    } catch (e) {
      console.error("Error agregando ingrediente:", e);
    }
  };

  const actualizarIngrediente = async (id: string, datos: Partial<Ingrediente>) => {
    try {
      const updates: any = { fecha_actualizacion: new Date().toISOString() };
      if (datos.nombre) updates.nombre = datos.nombre;
      if (datos.categoria) updates.categoria = datos.categoria;
      if (datos.unidadCompra) updates.unidad_compra = datos.unidadCompra;
      if (datos.costoUnitario) updates.costo_unitario = datos.costoUnitario;
      if (datos.proveedor) updates.proveedor = datos.proveedor;
      if (datos.densidad) updates.densidad = datos.densidad;

      const { error } = await (supabase.from('insumos') as any).update(updates).eq('id', id);
      if (error) throw error;
      await cargarDatos();
    } catch (e) {
      console.error("Error actualizando ingrediente:", e);
    }
  };

  const eliminarIngrediente = async (id: string) => {
    try {
      const { error } = await (supabase.from('insumos') as any).delete().eq('id', id);
      if (error) { alert("Error al eliminar: " + error.message); throw error; }
      await cargarDatos();
    } catch (e) {
      console.error("Error eliminando ingrediente:", e);
    }
  };

  const agregarReceta = async (receta: Omit<Receta, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'costoTotal' | 'margenGanancia'>) => {
    try {
      const { data: recetaData, error: recetaError } = await (supabase
        .from('recetas') as any)
        .insert({
          nombre: receta.nombre,
          descripcion: receta.descripcion,
          categoria: receta.categoria,
          tipo: receta.tipo || 'PLATO', // [NEW] V6
          tiempo_preparacion: receta.tiempoPreparacion || 0,
          porciones: receta.porciones,
          precio_venta: receta.precioVenta,
          imagen: receta.imagen,
          activa: true,
          pasos: receta.pasos || [] // JSONB
        })
        .select()
        .single();

      if (recetaError) throw recetaError;

      const ingredientesInsert = receta.ingredientes.map(ing => ({
        receta_id: recetaData.id,
        ingrediente_id: ing.ingredienteId || null,
        sub_receta_id: ing.subRecetaId || null,
        cantidad: ing.cantidad,
        unidad_uso: ing.unidadUso,
        costo_calculado: ing.costoCalculado
      })) as any;

      if (ingredientesInsert.length > 0) {
        const { error: ingError } = await (supabase.from('receta_ingredientes') as any).insert(ingredientesInsert);
        if (ingError) throw ingError;
      }

      // Optimización: No recargar todo, solo esta receta
      await recargarReceta(recetaData.id);
      return recetaData;

    } catch (e) {
      console.error("Error agregando receta:", e);
    }
  };

  const actualizarReceta = async (id: string, datos: Partial<Receta>) => {
    try {
      const updates: any = { fecha_actualizacion: new Date().toISOString() };
      if (datos.nombre) updates.nombre = datos.nombre;
      if (datos.descripcion !== undefined) updates.descripcion = datos.descripcion;
      if (datos.categoria) updates.categoria = datos.categoria;
      if (datos.tipo) updates.tipo = datos.tipo; // [NEW] V6
      if (datos.porciones) updates.porciones = datos.porciones;
      if (datos.tiempoPreparacion) updates.tiempo_preparacion = datos.tiempoPreparacion;
      if (datos.precioVenta) updates.precio_venta = datos.precioVenta;
      if (datos.imagen !== undefined) updates.imagen = datos.imagen;
      if (datos.pasos !== undefined) updates.pasos = datos.pasos;

      const { error } = await (supabase.from('recetas') as any).update(updates).eq('id', id);
      if (error) throw error;

      if (datos.ingredientes) {
        await (supabase.from('receta_ingredientes') as any).delete().eq('receta_id', id);
        const nuevosIngs = datos.ingredientes.map(ing => ({
          receta_id: id,
          ingrediente_id: ing.ingredienteId || null,
          sub_receta_id: ing.subRecetaId || null,
          cantidad: ing.cantidad,
          unidad_uso: ing.unidadUso,
          costo_calculado: ing.costoCalculado
        }));
        if (nuevosIngs.length > 0) {
          await (supabase.from('receta_ingredientes') as any).insert(nuevosIngs);
        }
      }


      // Optimización: Recargar solo esta receta
      await recargarReceta(id);

      // Si esta receta es sub-receta de otras, ahí SI valdría la pena recargar todo
      // o ser muy inteligente recursivamente. Por seguridad, si el usuario nota inconsistencias
      // en padres, puede recargar página. Para el caso común (editar receta final), esto basta.
    } catch (e) {
      console.error("Error actualizando receta:", e);
    }
  };

  const eliminarReceta = async (id: string) => {
    try {
      const { error } = await supabase.from('recetas').delete().eq('id', id);
      if (error) throw error;
      await cargarDatos();
    } catch (e) {
      console.error("Error eliminando receta:", e);
    }
  };

  const getRecetaById = (id: string) => recetas.find(r => r.id === id);
  const getIngredienteById = (id: string) => ingredientes.find(i => i.id === id);

  // ============================================
  // ESTADÍSTICAS Y UTILIDADES
  // ============================================

  const getEstadisticas = () => {
    const totalRecetas = recetas.length;
    const recetasActivas = recetas.filter(r => r.activa).length;
    const totalIngredientes = ingredientes.length;
    const ingredientesActivos = ingredientes.filter(i => i.activo).length;

    const recetasRentables = recetas.filter(r => {
      const indicador = getIndicadorRentabilidad(r.costoTotal, r.precioVenta);
      return indicador === 'verde';
    }).length;

    const costoPromedio = recetas.length > 0
      ? recetas.reduce((sum, r) => sum + r.costoTotal, 0) / recetas.length
      : 0;

    const margenPromedio = recetas.length > 0
      ? recetas.reduce((sum, r) => sum + r.margenGanancia, 0) / recetas.length
      : 0;

    return { totalRecetas, recetasActivas, totalIngredientes, ingredientesActivos, recetasRentables, costoPromedio, margenPromedio };
  };

  const getRecetasPorCategoria = useCallback(() => {
    const categorias: Record<string, number> = {};
    recetas.forEach(receta => {
      categorias[receta.categoria] = (categorias[receta.categoria] || 0) + 1;
    });
    return Object.entries(categorias).map(([nombre, cantidad]) => ({
      nombre,
      cantidad
    }));
  }, [recetas]);

  const actualizacionMasiva = async (actualizaciones: { id: string; costoUnitario: number }[]) => {
    try {
      for (const act of actualizaciones) {
        await (supabase.from('insumos') as any).update({ costo_unitario: act.costoUnitario } as any).eq('id', act.id);
      }
      await cargarDatos();
    } catch (e) {
      console.error("Error en actualización masiva:", e);
    }
  };

  const inicializarBaseDeDatos = async () => {
    if (!confirm("¿Cargar ingredientes base a Supabase?")) return;
    try {
      for (const ing of INGREDIENTES_INICIALES) {
        await agregarIngrediente(ing);
      }
      alert("Datos cargados. Recargando...");
      window.location.reload();
    } catch (e) {
      alert("Error cargando seed data");
      console.error(e);
    }
  };

  // ============================================
  // FASE 4: PRODUCCIÓN Y REPORTES
  // ============================================

  const registrarProduccion = async (produccion: {
    recetaId: string;
    cantidad: number;
    costoUnitarioSnapshot: number;
    costoTotal: number;
  }) => {
    try {
      const { data, error } = await (supabase
        .from('historial_produccion') as any)
        .insert({
          receta_id: produccion.recetaId,
          cantidad_producida: produccion.cantidad,
          costo_unitario_snapshot: produccion.costoUnitarioSnapshot,
          costo_total: produccion.costoTotal,
          fecha: new Date().toISOString(),
          tipo: 'PRODUCCION'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error("Error registrando producción:", e);
      throw e;
    }
  };

  const registrarMerma = async (merma: {
    recetaId: string;
    cantidad: number;
    costoUnitarioSnapshot: number;
    costoTotal: number;
    motivo: string;
  }) => {
    try {
      const { data, error } = await (supabase
        .from('historial_produccion') as any)
        .insert({
          receta_id: merma.recetaId,
          cantidad_producida: merma.cantidad,
          costo_unitario_snapshot: merma.costoUnitarioSnapshot,
          costo_total: merma.costoTotal,
          fecha: new Date().toISOString(),
          tipo: 'MERMA',
          motivo: merma.motivo
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error("Error registrando merma:", e);
      throw e;
    }
  };

  const registrarVenta = async (venta: {
    recetaId: string;
    cantidad: number;
    costoUnitarioSnapshot: number;
    costoTotal: number;
  }) => {
    try {
      const { data, error } = await (supabase
        .from('historial_produccion') as any)
        .insert({
          receta_id: venta.recetaId,
          cantidad_producida: venta.cantidad,
          costo_unitario_snapshot: venta.costoUnitarioSnapshot,
          costo_total: venta.costoTotal,
          fecha: new Date().toISOString(),
          tipo: 'VENTA'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error("Error registrando venta:", e);
      throw e;
    }
  };

  const registrarMovimiento = async (movimiento: {
    tipo: 'COMPRA' | 'MERMA' | 'AJUSTE';
    ingredienteId: string;
    cantidad: number;
    unidadMedida: string;
    costoUnitario: number;
    costoTotal: number;
    motivo?: string;
  }) => {
    try {
      const { data, error } = await (supabase
        .from('movimientos_inventario') as any)
        .insert({
          tipo: movimiento.tipo,
          ingrediente_id: movimiento.ingredienteId,
          cantidad: movimiento.cantidad,
          unidad_medida: movimiento.unidadMedida,
          costo_unitario_snapshot: movimiento.costoUnitario,
          costo_total: movimiento.costoTotal,
          motivo: movimiento.motivo,
          fecha: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error("Error registrando movimiento:", e);
      throw e;
    }
  };

  const fetchHistorialProduccion = async () => {
    try {
      const { data, error } = await (supabase
        .from('historial_produccion') as any)
        .select(`
          *,
          recetas (nombre)
        `)
        .order('fecha', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        fecha: item.fecha,
        recetaId: item.receta_id,
        nombreReceta: item.recetas ? (Array.isArray(item.recetas) ? item.recetas[0].nombre : item.recetas.nombre) : 'Desconocida',
        cantidadProducida: Number(item.cantidad_producida),
        costoUnitarioSnapshot: Number(item.costo_unitario_snapshot),
        costoTotal: Number(item.costo_total),
        tipo: item.tipo || 'PRODUCCION',
        motivo: item.motivo
      }));
    } catch (e) {
      console.error("Error fetching historial:", e);
      return [];
    }
  };

  return {
    ingredientes,
    recetas,
    isLoading,
    agregarIngrediente,
    actualizarIngrediente,
    eliminarIngrediente,
    actualizacionMasiva,
    getIngredienteById,
    agregarReceta,
    actualizarReceta,
    eliminarReceta,
    getRecetaById,
    getEstadisticas,
    getRecetasPorCategoria,
    inicializarBaseDeDatos,
    registrarProduccion,
    registrarMerma,
    registrarVenta,
    registrarMovimiento,
    fetchHistorialProduccion
  };
}

export default useDatabase;
