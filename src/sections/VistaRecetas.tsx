
import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  ChefHat,
  Clock,
  Users,
  TrendingUp,
  Image as ImageIcon,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  PlayCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Receta, Ingrediente } from '@/types';
import {
  CATEGORIAS_RECETAS,
  formatCurrency,
  formatPercent,
  getIndicadorRentabilidad
} from '@/types';
import { Semaforo } from './Dashboard';

// ============================================
// COMPONENTE: MODO COCINA (WIZARD)
// ============================================

interface ModoCocinaProps {
  receta: Receta;
  onCerrar: () => void;
}

function ModoCocina({ receta, onCerrar }: ModoCocinaProps) {
  const [pasoActual, setPasoActual] = useState(0);
  const pasos = receta.pasos || [];
  const totalPasos = pasos.length;

  if (totalPasos === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4">
        <ChefHat className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sin pasos registrados</h2>
        <p className="text-gray-500 mb-6">Esta receta no tiene pasos de preparación detallados.</p>
        <Button onClick={onCerrar} size="lg">Volver</Button>
      </div>
    )
  }

  const paso = pasos[pasoActual];
  const progreso = ((pasoActual + 1) / totalPasos) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div>
          <h2 className="text-lg font-bold text-emerald-400">{receta.nombre}</h2>
          <p className="text-sm text-gray-400">Paso {pasoActual + 1} de {totalPasos}</p>
        </div>
        <Button variant="ghost" className="text-white hover:bg-gray-800" onClick={onCerrar}>
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Progreso */}
      <div className="h-2 bg-gray-800 w-full">
        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progreso}%` }} />
      </div>

      {/* Contenido Central */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="max-w-3xl w-full space-y-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-3xl mb-4 border border-emerald-500/50">
            {pasoActual + 1}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            {paso.titulo}
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
            {paso.descripcion}
          </p>

          {paso.tiempoEstimado && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full text-blue-300 border border-blue-900/50">
              <Clock className="w-5 h-5" />
              <span className="text-lg font-medium">{paso.tiempoEstimado} min</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navegación */}
      <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-between items-center max-w-5xl mx-auto w-full">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setPasoActual(prev => Math.max(0, prev - 1))}
          disabled={pasoActual === 0}
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Anterior
        </Button>

        {pasoActual < totalPasos - 1 ? (
          <Button
            size="lg"
            onClick={() => setPasoActual(prev => Math.min(totalPasos - 1, prev + 1))}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-14 text-lg"
          >
            Siguiente
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={onCerrar}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 h-14 text-lg"
          >
            <CheckCircle className="w-6 h-6 mr-2" />
            Finalizar Receta
          </Button>
        )}
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE: TARJETA DE RECETA (VISTA CHEF)
// ============================================

interface RecetaCardProps {
  receta: Receta;
  onVer: () => void;
  onEditar: () => void;
  onEliminar: () => void;
}

function RecetaCardChef({ receta, onVer, onEditar, onEliminar }: RecetaCardProps) {
  const indicador = getIndicadorRentabilidad(receta.costoTotal, receta.precioVenta);

  const borderColors = {
    verde: 'border-emerald-200 hover:border-emerald-300',
    amarillo: 'border-amber-200 hover:border-amber-300',
    rojo: 'border-red-200 hover:border-red-300'
  };

  return (
    <Card className={`border-2 ${borderColors[indicador]} transition-all duration-200 overflow-hidden group flex flex-col h-full`}>
      {/* Imagen */}
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        {receta.imagen ? (
          <img
            src={receta.imagen}
            alt={receta.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-gray-300" />
          </div>
        )}

        {/* Badge de categoría */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 text-gray-700 backdrop-blur-sm">
            {receta.categoria}
          </Badge>
        </div>

        {/* Indicador de rentabilidad */}
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
            <Semaforo costo={receta.costoTotal} precioVenta={receta.precioVenta} size="sm" />
          </div>
        </div>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
          {receta.nombre}
        </h3>

        {receta.descripcion && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{receta.descripcion}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{receta.tiempoPreparacion} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{receta.porciones}p</span>
          </div>
          {receta.pasos && receta.pasos.length > 0 && (
            <div className="flex items-center gap-1 text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
              <ChefHat className="w-3 h-3" />
              <span>{receta.pasos.length} pasos</span>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Costos */}
        <div className="space-y-2 mb-4 bg-gray-50 p-2 rounded-lg text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Costo:</span>
            <span className="font-semibold">{formatCurrency(receta.costoTotal / receta.porciones)}/p</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Venta:</span>
            <span className="font-semibold text-emerald-600">{formatCurrency(receta.precioVenta)}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <Button
            variant="default"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={onVer}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Cocinar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onVer}>
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEditar}>
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEliminar} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPONENTE: DETALLE DE RECETA
// ============================================

interface DetalleRecetaProps {
  receta: Receta;
  ingredientes: Ingrediente[];
  onCerrar: () => void;
  onEditar: () => void;
  onIniciarCocina: () => void; // [NEW]
}

function DetalleReceta({ receta, ingredientes, onCerrar, onEditar, onIniciarCocina }: DetalleRecetaProps) {
  const tienePasos = receta.pasos && receta.pasos.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{receta.categoria}</Badge>
            <Semaforo costo={receta.costoTotal} precioVenta={receta.precioVenta} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{receta.nombre}</h2>
          {receta.descripcion && (
            <p className="text-gray-500 mt-1 max-w-2xl">{receta.descripcion}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onCerrar}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <Button onClick={onEditar} variant="outline">
            <Edit2 className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button onClick={onIniciarCocina} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20" size="lg">
            <PlayCircle className="w-5 h-5 mr-2" />
            Modo Cocina
          </Button>
        </div>
      </div>

      {/* Imagen */}
      {receta.imagen && (
        <div className="aspect-video w-full max-h-[400px] rounded-xl overflow-hidden bg-gray-100 shadow-md">
          <img src={receta.imagen} alt={receta.nombre} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Info general */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-blue-700 font-medium">Tiempo</p>
            <p className="text-2xl font-bold text-gray-900">{receta.tiempoPreparacion} <span className="text-sm font-normal text-gray-500">min</span></p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-sm text-orange-700 font-medium">Porciones</p>
            <p className="text-2xl font-bold text-gray-900">{receta.porciones}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <CardContent className="p-4 text-center">
            <ChefHat className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-purple-700 font-medium">Pasos</p>
            <p className="text-2xl font-bold text-gray-900">{receta.pasos?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm text-emerald-700 font-medium">Margen</p>
            <p className={`text-2xl font-bold ${receta.margenGanancia >= 50 ? 'text-emerald-600' : 'text-red-500'}`}>
              {formatPercent(receta.margenGanancia)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingredientes - Columna Izquierda */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ChefHat className="w-5 h-5" /> Ingredientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {receta.ingredientes.map((ing, index) => {
                  const ingrediente = ingredientes.find(i => i.id === ing.ingredienteId);
                  const esSubReceta = !!ing.subRecetaId;
                  let nombre = ing.nombreIngrediente || (ingrediente?.nombre) || "Desconocido";

                  return (
                    <div
                      key={ing.id}
                      className={`flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 ${esSubReceta ? 'bg-amber-50/50 p-2 rounded-md' : ''}`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${esSubReceta ? 'bg-amber-200 text-amber-800' : 'bg-emerald-100 text-emerald-600'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm leading-tight">{nombre}</p>
                        <p className="text-sm text-gray-500">
                          {ing.cantidad} {ing.unidadUso === 'pieza' ? 'u' : ing.unidadUso}
                        </p>
                      </div>
                      <p className="font-medium text-gray-400 text-xs">
                        {formatCurrency(ing.costoCalculado)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pasos - Columna Central/Derecha */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Instrucciones
                {!tienePasos && <Badge variant="outline" className="ml-2 font-normal text-gray-500">Sin pasos detallados</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tienePasos ? (
                <div className="space-y-4">
                  {receta.pasos!.map((paso, idx) => (
                    <div key={idx} className="flex gap-4 group">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                          {idx + 1}
                        </div>
                        {idx !== receta.pasos!.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 group-hover:bg-emerald-50" />}
                      </div>
                      <div className="flex-1 pb-6">
                        <h4 className="text-base font-semibold text-gray-900">{paso.titulo}</h4>
                        <p className="text-gray-600 mt-1 leading-relaxed text-sm">{paso.descripcion}</p>
                        {paso.tiempoEstimado && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 bg-blue-50 inline-flex px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            {paso.tiempoEstimado} min
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p>No se han registrado pasos para esta receta.</p>
                  <Button variant="link" onClick={onEditar} className="mt-2 text-emerald-600">
                    Editar Receta para agregar pasos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL: VISTA RECETAS
// ============================================

interface VistaRecetasProps {
  recetas: Receta[];
  ingredientes: Ingrediente[];
  onNuevaReceta: () => void;
  onEditarReceta: (receta: Receta) => void;
  onEliminarReceta: (id: string) => void;
}

export function VistaRecetas({
  recetas,
  ingredientes,
  onNuevaReceta,
  onEditarReceta,
  onEliminarReceta
}: VistaRecetasProps) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | null>(null);
  const [dialogoEliminar, setDialogoEliminar] = useState<string | null>(null);
  const [modoCocinaActivo, setModoCocinaActivo] = useState(false); // [NEW] Estado para el wizard

  const recetasFiltradas = useMemo(() => {
    return recetas.filter(receta => {
      const matchBusqueda = receta.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        receta.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
      const matchCategoria = !categoriaFiltro || categoriaFiltro === "TODAS" || receta.categoria === categoriaFiltro;
      return matchBusqueda && matchCategoria;
    });
  }, [recetas, busqueda, categoriaFiltro]);

  // Agrupar por categoría
  const recetasPorCategoria = useMemo(() => {
    const grupos: Record<string, Receta[]> = {};
    recetasFiltradas.forEach(receta => {
      if (!grupos[receta.categoria]) {
        grupos[receta.categoria] = [];
      }
      grupos[receta.categoria].push(receta);
    });
    return grupos;
  }, [recetasFiltradas]);

  // Si el modo cocina está activo (overlay)
  if (modoCocinaActivo && recetaSeleccionada) {
    return (
      <ModoCocina
        receta={recetaSeleccionada}
        onCerrar={() => setModoCocinaActivo(false)}
      />
    )
  }

  if (recetaSeleccionada) {
    return (
      <div className="max-w-6xl mx-auto">
        <DetalleReceta
          receta={recetaSeleccionada}
          ingredientes={ingredientes}
          onCerrar={() => setRecetaSeleccionada(null)}
          onEditar={() => {
            setRecetaSeleccionada(null);
            onEditarReceta(recetaSeleccionada);
          }}
          onIniciarCocina={() => setModoCocinaActivo(true)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestor de Recetas</h1>
          <p className="text-gray-500">Administra tus recetas y calcula costos</p>
        </div>
        <Button onClick={onNuevaReceta} className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Receta
        </Button>
      </div>

      {/* Filtros */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar receta..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={categoriaFiltro}
              onValueChange={setCategoriaFiltro}
            >
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAS">Todas</SelectItem>
                {CATEGORIAS_RECETAS.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Recetas */}
      {recetasFiltradas.length === 0 ? (
        <Card className="border-gray-200 border-dashed">
          <CardContent className="p-8 text-center">
            <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-1">No hay recetas</h3>
            <p className="text-sm text-gray-500 mb-4">Comienza creando tu primera receta</p>
            <Button onClick={onNuevaReceta} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Crear Receta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(recetasPorCategoria).map(([categoria, recetasCat]) => (
            <div key={categoria}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {categoria}
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">{recetasCat.length}</Badge>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {recetasCat.map((receta) => (
                  <RecetaCardChef
                    key={receta.id}
                    receta={receta}
                    onVer={() => setRecetaSeleccionada(receta)}
                    onEditar={() => onEditarReceta(receta)}
                    onEliminar={() => setDialogoEliminar(receta.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogo eliminar */}
      <Dialog open={!!dialogoEliminar} onOpenChange={() => setDialogoEliminar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar receta?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La receta se eliminará permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogoEliminar(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (dialogoEliminar) {
                  onEliminarReceta(dialogoEliminar);
                  setDialogoEliminar(null);
                }
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VistaRecetas;
