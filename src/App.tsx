import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/sections/Dashboard';
import { VistaInsumos } from '@/sections/VistaInsumos';
import { VistaRecetas } from '@/sections/VistaRecetas';
import { VistaProduccion } from '@/sections/VistaProduccion';
import { VistaMermas } from '@/sections/VistaMermas';
import { VistaVentas } from '@/sections/VistaVentas';
import { FormularioReceta } from '@/sections/FormularioReceta';
import { useDatabase } from '@/hooks/useDatabase';
import type { Vista, Receta, RolUsuario } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

// ============================================
// COMPONENTE PRINCIPAL: APP
// ============================================

function App() {
  // Estado de navegación
  const [vistaActual, setVistaActual] = useState<Vista>('dashboard');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [rolUsuario] = useState<RolUsuario>('admin'); // En producción vendría de auth

  // Estado para edición de recetas
  const [recetaEditando, setRecetaEditando] = useState<Receta | undefined>();

  // Base de datos
  const {
    ingredientes,
    recetas,
    isLoading,
    agregarIngrediente,
    actualizarIngrediente,
    eliminarIngrediente,
    agregarReceta,
    actualizarReceta,
    eliminarReceta
  } = useDatabase();

  // ============================================
  // HANDLERS DE INGREDIENTES
  // ============================================

  const handleAgregarIngrediente = (ingrediente: Parameters<typeof agregarIngrediente>[0]) => {
    agregarIngrediente(ingrediente);
    toast.success('Insumo agregado correctamente');
  };

  const handleActualizarIngrediente = (id: string, datos: Parameters<typeof actualizarIngrediente>[1]) => {
    actualizarIngrediente(id, datos);
    toast.success('Insumo actualizado correctamente');
  };

  const handleEliminarIngrediente = (id: string) => {
    eliminarIngrediente(id);
    toast.success('Insumo eliminado correctamente');
  };

  // ============================================
  // HANDLERS DE RECETAS
  // ============================================

  const handleNuevaReceta = () => {
    setRecetaEditando(undefined);
    setVistaActual('nueva-receta');
  };

  const handleEditarReceta = (receta: Receta) => {
    setRecetaEditando(receta);
    setVistaActual('editar-receta');
  };

  const handleGuardarReceta = (datos: Parameters<typeof agregarReceta>[0]) => {
    if (recetaEditando) {
      actualizarReceta(recetaEditando.id, datos);
      toast.success('Receta actualizada correctamente');
    } else {
      agregarReceta(datos);
      toast.success('Receta creada correctamente');
    }
    setVistaActual('recetas');
    setRecetaEditando(undefined);
  };

  const handleEliminarReceta = (id: string) => {
    eliminarReceta(id);
    toast.success('Receta eliminada correctamente');
  };

  const handleVerReceta = (recetaId: string) => {
    const receta = recetas.find(r => r.id === recetaId);
    if (receta) {
      setRecetaEditando(receta);
      setVistaActual('editar-receta');
    }
  };

  // ============================================
  // RENDERIZADO DE VISTAS
  // ============================================

  const renderVista = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
            <p className="text-gray-500">Cargando KitchenLedger...</p>
          </div>
        </div>
      );
    }

    switch (vistaActual) {
      case 'dashboard':
        return (
          <Dashboard
            onVerReceta={handleVerReceta}
            onNuevaReceta={handleNuevaReceta}
          />
        );

      case 'insumos':
        return (
          <VistaInsumos
            ingredientes={ingredientes}
            onAgregar={handleAgregarIngrediente}
            onActualizar={handleActualizarIngrediente}
            onEliminar={handleEliminarIngrediente}
          />
        );

      case 'recetas':
        return (
          <VistaRecetas
            recetas={recetas}
            ingredientes={ingredientes}
            onNuevaReceta={handleNuevaReceta}
            onEditarReceta={handleEditarReceta}
            onEliminarReceta={handleEliminarReceta}
          />
        );

      case 'produccion':
        return <VistaProduccion />;

      case 'mermas':
        return <VistaMermas />;

      case 'ventas':
        return <VistaVentas />;

      case 'nueva-receta':
      case 'editar-receta':
        return (
          <FormularioReceta
            receta={recetaEditando}
            ingredientes={ingredientes}
            recetas={recetas} // [NEW] Fase 2
            onGuardar={handleGuardarReceta}
            onCancelar={() => {
              setVistaActual('recetas');
              setRecetaEditando(undefined);
            }}
          />
        );

      default:
        return <Dashboard onVerReceta={handleVerReceta} onNuevaReceta={handleNuevaReceta} />;
    }
  };

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación */}
      <Navigation
        vistaActual={vistaActual}
        onCambiarVista={setVistaActual}
        rolUsuario={rolUsuario}
        menuAbierto={menuAbierto}
        onToggleMenu={() => setMenuAbierto(!menuAbierto)}
      />

      {/* Contenido principal */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {renderVista()}
        </div>
      </main>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
          },
        }}
      />
    </div>
  );
}

export default App;
