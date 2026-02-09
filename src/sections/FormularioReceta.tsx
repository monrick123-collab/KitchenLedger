import { useState } from 'react';
import {
  Plus,
  Trash2,
  Camera,
  ChefHat,
  Users,
  DollarSign,
  Calculator,
  Save,
  X,
  Upload,
  AlertCircle,
  Check,
  List,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Receta, Ingrediente, IngredienteReceta, UnidadMedida, PasoReceta } from '@/types';
import {
  CATEGORIAS_RECETAS,
  UNIDADES,
  formatCurrency,
  formatPercent,
  getIndicadorRentabilidad,
  calcularCostoProporcional,
  generateId
} from '@/types';
import { Copy } from 'lucide-react';

// ============================================
// COMPONENTE: SELECTOR DE INGREDIENTE (CON SUB-RECETAS)
// ============================================

interface SelectorIngredienteProps {
  ingredientes: Ingrediente[];
  recetas: Receta[]; // [NEW] Para sub-recetas
  seleccionado: IngredienteReceta | null;
  onSeleccionar: (ingrediente: IngredienteReceta) => void;
  onCancelar: () => void;
}

function SelectorIngrediente({ ingredientes, recetas, seleccionado, onSeleccionar, onCancelar }: SelectorIngredienteProps) {
  const [tab, setTab] = useState<'insumo' | 'receta'>('insumo');
  const [itemId, setItemId] = useState(seleccionado?.ingredienteId || seleccionado?.subRecetaId || '');
  const [cantidad, setCantidad] = useState(seleccionado?.cantidad || 0);
  const [unidadUso, setUnidadUso] = useState<UnidadMedida>(seleccionado?.unidadUso || 'g');

  const insumoSeleccionado = ingredientes.find(i => i.id === itemId);
  const subRecetaSeleccionada = recetas.find(r => r.id === itemId);

  const handleGuardar = () => {
    if ((!insumoSeleccionado && !subRecetaSeleccionada) || cantidad <= 0) return;

    let costoCalculado = 0;

    if (tab === 'insumo' && insumoSeleccionado) {
      costoCalculado = calcularCostoProporcional(
        cantidad,
        unidadUso,
        insumoSeleccionado.unidadCompra,
        insumoSeleccionado.costoUnitario
      );
      onSeleccionar({
        id: seleccionado?.id || generateId(),
        ingredienteId: itemId,
        cantidad,
        unidadUso,
        costoCalculado,
        nombreIngrediente: insumoSeleccionado.nombre
      });
    } else if (tab === 'receta' && subRecetaSeleccionada) {
      // Para sub-recetas:
      // Asumimos que la "unidad de compra/uso" de una receta es "porción" o "gramos" (dependiendo de cómo se defina).
      // Simplificación V1: La receta completa cuesta X y pesa Y (o son Z porciones).
      // Si usamos 'porciones' como unidad:
      const costoPorPorcion = subRecetaSeleccionada.costoTotal / subRecetaSeleccionada.porciones;

      // Si la unidad seleccionada es 'pieza' (interpretado como porción aquí, o podríamos agregar 'porcion' a types)
      // Usaremos 'pieza' por ahora como equivalente a 'porción'
      costoCalculado = cantidad * costoPorPorcion;

      onSeleccionar({
        id: seleccionado?.id || generateId(),
        subRecetaId: itemId,
        cantidad,
        unidadUso: 'pieza', // Hardcoded por ahora para sub-recetas (porciones)
        costoCalculado,
        nombreIngrediente: `(Sub) ${subRecetaSeleccionada.nombre}`
      });
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(v) => { setTab(v as any); setItemId(''); }}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="insumo">Insumo Individual</TabsTrigger>
          <TabsTrigger value="receta">Sub-Receta (Prep)</TabsTrigger>
        </TabsList>

        <TabsContent value="insumo" className="space-y-4">
          <div className="space-y-2">
            <Label>Insumo Base</Label>
            <Select value={itemId} onValueChange={setItemId}>
              <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
              <SelectContent className="max-h-60">
                {ingredientes.map(i => (
                  <SelectItem key={i.id} value={i.id}>{i.nombre} ({formatCurrency(i.costoUnitario)}/{i.unidadCompra})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {insumoSeleccionado && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input type="number" value={cantidad} onChange={e => setCantidad(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Unidad</Label>
                <Select value={unidadUso} onValueChange={(v: any) => setUnidadUso(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(UNIDADES).filter(([_, u]) => u.unidadBase === UNIDADES[insumoSeleccionado.unidadCompra].unidadBase)
                      .map(([k, u]) => <SelectItem key={k} value={k}>{u.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="receta" className="space-y-4">
          <div className="bg-amber-50 p-3 rounded-md text-sm text-amber-800 border border-amber-200">
            Usa una receta existente como ingrediente (ej. Salsas, Masas).
            La unidad se medirá en <strong>Porciones</strong>.
          </div>
          <div className="space-y-2">
            <Label>Receta Base</Label>
            <Select value={itemId} onValueChange={setItemId}>
              <SelectTrigger><SelectValue placeholder="Selecciona preparación..." /></SelectTrigger>
              <SelectContent className="max-h-60">
                {recetas.map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.nombre} (Costo: {formatCurrency(r.costoTotal / r.porciones)}/porcion)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {subRecetaSeleccionada && (
            <div className="space-y-2">
              <Label>Cantidad de Porciones</Label>
              <Input type="number" value={cantidad} onChange={e => setCantidad(Number(e.target.value))} />
              <p className="text-sm text-gray-500 text-right">
                Costo estimado: {formatCurrency(cantidad * (subRecetaSeleccionada.costoTotal / subRecetaSeleccionada.porciones))}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancelar} className="flex-1">Cancelar</Button>
        <Button onClick={handleGuardar} className="flex-1 bg-emerald-600 hover:bg-emerald-700" disabled={!itemId || cantidad <= 0}>
          {seleccionado ? 'Actualizar' : 'Agregar'}
        </Button>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE: EDITOR DE PASOS
// ============================================

interface EditorPasosProps {
  pasos: PasoReceta[];
  onChange: (pasos: PasoReceta[]) => void;
}

function EditorPasos({ pasos, onChange }: EditorPasosProps) {
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoDesc, setNuevoDesc] = useState('');
  const [nuevoTiempo, setNuevoTiempo] = useState(0);

  const agregarPaso = () => {
    if (!nuevoDesc) return;
    onChange([...pasos, { titulo: nuevoTitulo || `Paso ${pasos.length + 1}`, descripcion: nuevoDesc, tiempoEstimado: nuevoTiempo }]);
    setNuevoTitulo('');
    setNuevoDesc('');
    setNuevoTiempo(0);
  };

  const eliminarPaso = (index: number) => {
    const nuevos = [...pasos];
    nuevos.splice(index, 1);
    onChange(nuevos);
  };

  const moverPaso = (index: number, direccion: 'arriba' | 'abajo') => {
    if (direccion === 'arriba' && index === 0) return;
    if (direccion === 'abajo' && index === pasos.length - 1) return;

    const nuevos = [...pasos];
    const swapIndex = direccion === 'arriba' ? index - 1 : index + 1;
    [nuevos[index], nuevos[swapIndex]] = [nuevos[swapIndex], nuevos[index]];
    onChange(nuevos);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {pasos.map((paso, idx) => (
          <Card key={idx} className="p-3 flex gap-3 items-start group">
            <div className="bg-emerald-100 text-emerald-700 w-8 h-8 flex items-center justify-center rounded-full font-bold flex-shrink-0 mt-1">
              {idx + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{paso.titulo}</h4>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{paso.descripcion}</p>
              {paso.tiempoEstimado ? <span className="text-xs text-blue-600 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> {paso.tiempoEstimado} min</span> : null}
            </div>
            <div className="flex flex-col gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moverPaso(idx, 'arriba')} disabled={idx === 0}><ArrowUp className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moverPaso(idx, 'abajo')} disabled={idx === pasos.length - 1}><ArrowDown className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => eliminarPaso(idx)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
        <h4 className="font-medium mb-3 flex items-center gap-2"><List className="w-4 h-4" /> Agregar Nuevo Paso</h4>
        <div className="space-y-3">
          <Input placeholder="Título (ej. Cortar verduras)" value={nuevoTitulo} onChange={e => setNuevoTitulo(e.target.value)} />
          <Textarea placeholder="Descripción detallada..." value={nuevoDesc} onChange={e => setNuevoDesc(e.target.value)} rows={2} />
          <div className="flex gap-2 items-center">
            <Input type="number" placeholder="Minutos estimados" className="w-32" value={nuevoTiempo || ''} onChange={e => setNuevoTiempo(Number(e.target.value))} />
            <span className="text-sm text-gray-500">min</span>
            <div className="flex-1" />
            <Button onClick={agregarPaso} disabled={!nuevoDesc} size="sm" className="bg-emerald-600 hover:bg-emerald-700">Agregar Paso</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// COMPONENTE: CALCULADORA DE PORCIONES
// ============================================

interface CalculadoraPorcionesProps {
  costoTotal: number;
  porcionesActuales: number;
  precioVentaActual: number;
  onAplicar: (porciones: number, precioVenta: number) => void;
}

function CalculadoraPorciones({
  costoTotal,
  porcionesActuales,
  precioVentaActual,
  onAplicar
}: CalculadoraPorcionesProps) {
  const [porciones, setPorciones] = useState(porcionesActuales);
  const [margenDeseado, setMargenDeseado] = useState(70);
  const [precioManual, setPrecioManual] = useState(precioVentaActual);
  const [modo, setModo] = useState<'margen' | 'manual'>('margen');

  const costoPorPorcion = porciones > 0 ? costoTotal / porciones : 0;

  const precioSugerido = modo === 'margen'
    ? costoPorPorcion / (1 - margenDeseado / 100)
    : precioManual;

  const margenCalculado = precioSugerido > 0
    ? ((precioSugerido - costoPorPorcion) / precioSugerido) * 100
    : 0;

  const indicador = getIndicadorRentabilidad(costoPorPorcion, precioSugerido);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Número de Porciones</Label>
        <Input
          type="number"
          min="1"
          value={porciones}
          onChange={(e) => setPorciones(parseInt(e.target.value) || 1)}
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-sm text-gray-600">
          Costo por porción: <span className="font-semibold">{formatCurrency(costoPorPorcion)}</span>
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={modo === 'margen' ? 'default' : 'outline'}
          onClick={() => setModo('margen')}
          className={modo === 'margen' ? 'bg-emerald-600' : ''}
        >
          Por Margen
        </Button>
        <Button
          variant={modo === 'manual' ? 'default' : 'outline'}
          onClick={() => setModo('manual')}
          className={modo === 'manual' ? 'bg-emerald-600' : ''}
        >
          Precio Manual
        </Button>
      </div>

      {modo === 'margen' ? (
        <div className="space-y-2">
          <Label>Margen de Ganancia Deseado (%)</Label>
          <Input
            type="number"
            min="0"
            max="99"
            value={margenDeseado}
            onChange={(e) => setMargenDeseado(parseFloat(e.target.value) || 0)}
          />
          <Progress value={margenDeseado} className="h-2" />
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Precio de Venta</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={precioManual}
            onChange={(e) => setPrecioManual(parseFloat(e.target.value) || 0)}
          />
        </div>
      )}

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Precio sugerido:</span>
          <span className="text-2xl font-bold text-emerald-700">
            {formatCurrency(precioSugerido)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Margen resultante:</span>
          <span className={`font-semibold ${margenCalculado >= 65 ? 'text-emerald-600' :
            margenCalculado >= 50 ? 'text-amber-600' : 'text-red-600'
            }`}>
            {formatPercent(margenCalculado)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Rentabilidad:</span>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${indicador === 'verde' ? 'bg-emerald-500' :
              indicador === 'amarillo' ? 'bg-amber-400' : 'bg-red-500'
              }`} />
            <span className="text-sm capitalize">{indicador}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={() => onAplicar(porciones, precioSugerido)}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        <Check className="w-4 h-4 mr-2" />
        Aplicar a Receta
      </Button>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL: FORMULARIO RECETA
// ============================================

interface FormularioRecetaProps {
  receta?: Receta;
  ingredientes: Ingrediente[];
  recetas: Receta[]; // [NEW] Proporcionar todas las recetas para sub-recetas
  onGuardar: (receta: Omit<Receta, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'costoTotal' | 'margenGanancia'>) => void;
  onCancelar: () => void;
}

export function FormularioReceta({ receta, ingredientes, recetas, onGuardar, onCancelar }: FormularioRecetaProps) {
  const [nombre, setNombre] = useState(receta?.nombre || '');
  const [tipo, setTipo] = useState<'PLATO' | 'PREPARACION'>(receta?.tipo || 'PLATO'); // [NEW] V6
  const [descripcion, setDescripcion] = useState(receta?.descripcion || '');
  const [categoria, setCategoria] = useState(receta?.categoria || CATEGORIAS_RECETAS[0]);
  const [porciones, setPorciones] = useState(receta?.porciones || 1);
  const [tiempoPreparacion, setTiempoPreparacion] = useState(receta?.tiempoPreparacion || 30);
  const [precioVenta, setPrecioVenta] = useState(receta?.precioVenta || 0);
  const [imagen, setImagen] = useState(receta?.imagen || '');
  const [ingredientesReceta, setIngredientesReceta] = useState<IngredienteReceta[]>(receta?.ingredientes || []);
  const [pasos, setPasos] = useState<PasoReceta[]>(receta?.pasos || []);

  const [dialogoIngrediente, setDialogoIngrediente] = useState(false);
  const [ingredienteEditando, setIngredienteEditando] = useState<IngredienteReceta | null>(null);
  const [dialogoCalculadora, setDialogoCalculadora] = useState(false);
  const [dialogoImportarPasos, setDialogoImportarPasos] = useState(false); // [NEW]

  // Calcular costo total
  const costoTotal = ingredientesReceta.reduce((sum, ing) => sum + ing.costoCalculado, 0);
  const margenGanancia = precioVenta > 0 ? ((precioVenta - costoTotal) / precioVenta) * 100 : 0;
  const costoPorPorcion = porciones > 0 ? costoTotal / porciones : 0;

  const handleAgregarIngrediente = (ingrediente: IngredienteReceta) => {
    if (ingredienteEditando) {
      setIngredientesReceta(prev =>
        prev.map(ing => ing.id === ingredienteEditando.id ? ingrediente : ing)
      );
    } else {
      setIngredientesReceta(prev => [...prev, ingrediente]);
    }
    setDialogoIngrediente(false);
    setIngredienteEditando(null);
  };

  const handleEliminarIngrediente = (id: string) => {
    setIngredientesReceta(prev => prev.filter(ing => ing.id !== id));
  };

  const handleEditarIngrediente = (ingrediente: IngredienteReceta) => {
    setIngredienteEditando(ingrediente);
    setDialogoIngrediente(true);
  };

  const handleNuevoIngrediente = () => {
    setIngredienteEditando(null);
    setDialogoIngrediente(true);
  };

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagen(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar({
      nombre,
      tipo, // [NEW] V6
      descripcion,
      categoria,
      porciones,
      tiempoPreparacion,
      precioVenta,
      imagen,
      ingredientes: ingredientesReceta,
      pasos: pasos, // [NEW]
      activa: true
    });
  };

  const handleAplicarCalculadora = (nuevasPorciones: number, nuevoPrecio: number) => {
    setPorciones(nuevasPorciones);
    setPrecioVenta(nuevoPrecio);
    setDialogoCalculadora(false);
  };

  const handleImportarPasos = (subRecetaId: string) => {
    const sub = recetas.find(r => r.id === subRecetaId);
    if (!sub || !sub.pasos) return;

    const nuevosPasos = sub.pasos.map(p => ({
      ...p,
      titulo: `[${sub.nombre}] ${p.titulo}`
    }));

    setPasos(prev => [...prev, ...nuevosPasos]);
    setDialogoImportarPasos(false);
    // Toast success opcional
  };

  const indicador = getIndicadorRentabilidad(costoTotal, precioVenta);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {receta ? 'Editar Receta' : 'Nueva Receta'}
          </h1>
          <p className="text-gray-500">
            {receta ? 'Modifica los datos de la receta' : 'Crea una nueva receta'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancelar}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={!nombre || ingredientesReceta.length === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Receta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selector de Tipo */}
              <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="tipo-plato"
                    name="tipoReceta"
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                    checked={tipo === 'PLATO'}
                    onChange={() => setTipo('PLATO')}
                  />
                  <Label htmlFor="tipo-plato" className="font-medium cursor-pointer">
                    Plato Fuerte / Venta
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="tipo-prep"
                    name="tipoReceta"
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                    checked={tipo === 'PREPARACION'}
                    onChange={() => setTipo('PREPARACION')}
                  />
                  <Label htmlFor="tipo-prep" className="font-medium cursor-pointer">
                    Sub-receta / Preparación Base
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nombre de la Receta *</Label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Pechuga a la Plancha"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Descripción Breve</Label>
                <Textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Resumen corto (ej. Plato principal con salsa...)"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_RECETAS.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tiempo (min)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={tiempoPreparacion}
                    onChange={(e) => setTiempoPreparacion(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PASOS DE PREPARACIÓN */}
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Pasos de Preparación</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogoImportarPasos(true)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Importar de Sub-receta
              </Button>
            </CardHeader>
            <CardContent>
              <EditorPasos pasos={pasos} onChange={setPasos} />
            </CardContent>
          </Card>

          {/* Imagen */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Foto de la Receta</CardTitle>
            </CardHeader>
            <CardContent>
              {imagen ? (
                <div className="relative">
                  <img
                    src={imagen}
                    alt="Receta"
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setImagen('')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Sube una foto de la receta</p>
                  <Label className="cursor-pointer">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImagenChange}
                    />
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                      <Upload className="w-4 h-4" />
                      Seleccionar Imagen
                    </span>
                  </Label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ingredientes */}
          <Card className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Ingredientes y Sub-Recetas *</CardTitle>
              <Button
                type="button"
                onClick={handleNuevoIngrediente}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Insumo / Sub-receta
              </Button>
            </CardHeader>
            <CardContent>
              {ingredientesReceta.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ChefHat className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay ingredientes agregados</p>
                  <p className="text-sm">Agrega ingredientes para calcular el costo</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {ingredientesReceta.map((ing, index) => {
                    // Si tiene ingredienteId, buscar en ingredientes. Si tiene subRecetaId, buscar en recetas.
                    let nombreItem = ing.nombreIngrediente || "Desconocido";
                    let esSub = !!ing.subRecetaId;

                    return (
                      <div
                        key={ing.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${esSub ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${esSub ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-600'}`}>
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">{nombreItem} {esSub && "(Sub-receta)"}</p>
                            <p className="text-sm text-gray-500">
                              {ing.cantidad} {UNIDADES[ing.unidadUso]?.nombrePlural || ing.unidadUso}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">
                            {formatCurrency(ing.costoCalculado)}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditarIngrediente(ing)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => handleEliminarIngrediente(ing.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna lateral - Costos */}
        <div className="space-y-6">
          <Card className="border-gray-200 sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Costos y Precio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Porciones */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Porciones
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={porciones}
                  onChange={(e) => setPorciones(parseInt(e.target.value) || 1)}
                />
              </div>

              {/* Costo Total */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Costo Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(costoTotal)}</p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(costoPorPorcion)} por porción
                </p>
              </div>

              {/* Precio de Venta */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Precio de Venta
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={precioVenta}
                  onChange={(e) => setPrecioVenta(parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Margen */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Margen</span>
                  <span className={`font-bold ${margenGanancia >= 65 ? 'text-emerald-600' :
                    margenGanancia >= 50 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                    {formatPercent(margenGanancia)}
                  </span>
                </div>
                <Progress
                  value={Math.min(margenGanancia, 100)}
                  className="h-2"
                />
              </div>

              {/* Indicador */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-500">Rentabilidad</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${indicador === 'verde' ? 'bg-emerald-500' :
                    indicador === 'amarillo' ? 'bg-amber-400' : 'bg-red-500'
                    }`} />
                  <span className="text-sm capitalize">{indicador}</span>
                </div>
              </div>

              {/* Botón calculadora */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setDialogoCalculadora(true)}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Calculadora de Precios
              </Button>

              {/* Alerta */}
              {indicador === 'rojo' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <p className="text-sm text-red-700">
                    El costo es muy alto. Considera subir el precio o reducir costos.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogo de ingrediente */}
      <Dialog open={dialogoIngrediente} onOpenChange={setDialogoIngrediente}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {ingredienteEditando ? 'Editar Elemento' : 'Agregar Elemento'}
            </DialogTitle>
            <DialogDescription>
              Añade un ingrediente básico o una sub-receta
            </DialogDescription>
          </DialogHeader>
          <SelectorIngrediente
            ingredientes={ingredientes}
            recetas={recetas.filter(r => r.id !== (receta?.id || 'new'))} // [FIX] Evitar recursión
            seleccionado={ingredienteEditando}
            onSeleccionar={handleAgregarIngrediente}
            onCancelar={() => {
              setDialogoIngrediente(false);
              setIngredienteEditando(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialogo de calculadora */}
      <Dialog open={dialogoCalculadora} onOpenChange={setDialogoCalculadora}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Calculadora de Precios</DialogTitle>
            <DialogDescription>
              Calcula el precio óptimo basado en el margen deseado
            </DialogDescription>
          </DialogHeader>
          <CalculadoraPorciones
            costoTotal={costoTotal}
            porcionesActuales={porciones}
            precioVentaActual={precioVenta}
            onAplicar={handleAplicarCalculadora}
          />
        </DialogContent>
      </Dialog>

      {/* Dialogo de importar pasos */}
      <Dialog open={dialogoImportarPasos} onOpenChange={setDialogoImportarPasos}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Importar Pasos de Sub-receta</DialogTitle>
            <DialogDescription>
              Selecciona una sub-receta usada para copiar sus pasos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {ingredientesReceta.filter(i => i.subRecetaId).length === 0 ? (
              <p className="text-center text-gray-500 text-sm">No hay sub-recetas agregadas en la lista de ingredientes.</p>
            ) : (
              ingredientesReceta.filter(i => i.subRecetaId).map(ing => (
                <Button
                  key={ing.subRecetaId}
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4"
                  onClick={() => handleImportarPasos(ing.subRecetaId!)}
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-gray-900">{ing.nombreIngrediente}</span>
                    <span className="text-xs text-gray-500">Clic para importar</span>
                  </div>
                </Button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}

// Icono de editar
function Edit({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export default FormularioReceta;
