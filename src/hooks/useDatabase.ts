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
      const { data: dataInsumos, error: errorInsumos } = await supabase
        .from('insumos')
        .select('*')
        .order('nombre');

      if (errorInsumos) throw errorInsumos;

      const ingredientesMapeados: Ingrediente[] = (dataInsumos || []).map(i => ({
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
      const { data: dataRecetas, error: errorRecetas } = await supabase
        .from('recetas')
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

      const recetasMapeadasPromises = (dataRecetas || []).map(async (r) => {
        const ingredientesReceta: IngredienteReceta[] = [];

        for (const ri of (r.receta_ingredientes || [])) {
          let costo = Number(ri.costo_calculado);
          let nombre = "Desconocido";

          if (ri.ingrediente_id) {
            const ingBase = ingredientesMapeados.find(i => i.id === ri.ingrediente_id);
            nombre = ingBase?.nombre || "Ingrediente Eliminado";
          } else if (ri.sub_receta_id) {
            // Si es sub-receta, por ahora usamos el nombre de la receta base si ya está cargada
            // De lo contrario, hacemos un fetch rápido o usamos un placeholder si hay recursión circular
            // OPCIÓN SIMPLE: Buscar en dataRecetas local (si ya cargó) o hacer fetch individual
            // Para evitar N+1 queries complex, asumiremos que dataRecetas trae todo, 
            // pero 'map' es síncrono. Mejor buscar en dataRecetas raw.
            const sub = (dataRecetas || []).find((s: any) => s.id === ri.sub_receta_id);
            nombre = sub ? `(Sub) ${sub.nombre}` : "(Sub) Desconocida";
            // El costo ya viene calculado y guardado en costo_calculado al crear, 
            // así que no necesitamos recalcular recursivamente AQUI en lectura para display rápido.
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

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // ============================================
  // OPERACIONES
  // ============================================

  const agregarIngrediente = async (ingrediente: Omit<Ingrediente, 'id' | 'fechaActualizacion'>) => {
    try {
      const { data, error } = await supabase
        .from('insumos')
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

      const { error } = await supabase.from('insumos').update(updates).eq('id', id);
      if (error) throw error;
      await cargarDatos();
    } catch (e) {
      console.error("Error actualizando ingrediente:", e);
    }
  };

  const eliminarIngrediente = async (id: string) => {
    try {
      const { error } = await supabase.from('insumos').delete().eq('id', id);
      if (error) { alert("Error al eliminar: " + error.message); throw error; }
      await cargarDatos();
    } catch (e) {
      console.error("Error eliminando ingrediente:", e);
    }
  };

  const agregarReceta = async (receta: Omit<Receta, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'costoTotal' | 'margenGanancia'>) => {
    try {
      const { data: recetaData, error: recetaError } = await supabase
        .from('recetas')
        .insert({
          nombre: receta.nombre,
          descripcion: receta.descripcion,
          categoria: receta.categoria,
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
      }));

      if (ingredientesInsert.length > 0) {
        const { error: ingError } = await supabase.from('receta_ingredientes').insert(ingredientesInsert);
        if (ingError) throw ingError;
      }

      await cargarDatos();
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
      if (datos.porciones) updates.porciones = datos.porciones;
      if (datos.tiempoPreparacion) updates.tiempo_preparacion = datos.tiempoPreparacion;
      if (datos.precioVenta) updates.precio_venta = datos.precioVenta;
      if (datos.imagen !== undefined) updates.imagen = datos.imagen;
      if (datos.pasos !== undefined) updates.pasos = datos.pasos;

      const { error } = await supabase.from('recetas').update(updates).eq('id', id);
      if (error) throw error;

      if (datos.ingredientes) {
        await supabase.from('receta_ingredientes').delete().eq('receta_id', id);
        const nuevosIngs = datos.ingredientes.map(ing => ({
          receta_id: id,
          ingrediente_id: ing.ingredienteId || null,
          sub_receta_id: ing.subRecetaId || null,
          cantidad: ing.cantidad,
          unidad_uso: ing.unidadUso,
          costo_calculado: ing.costoCalculado
        }));
        if (nuevosIngs.length > 0) {
          await supabase.from('receta_ingredientes').insert(nuevosIngs);
        }
      }
      await cargarDatos();
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
        await supabase.from('insumos').update({ costo_unitario: act.costoUnitario }).eq('id', act.id);
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
    registrarMovimiento,
    fetchHistorialProduccion
  };
}

export default useDatabase;
