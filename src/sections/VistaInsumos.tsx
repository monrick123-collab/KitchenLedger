import { useState, useMemo } from 'react';
import {
  Plus,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save } from 'lucide-react';

import type { Ingrediente, UnidadMedida } from '@/types';
import {
  UNIDADES,
  CATEGORIAS_INGREDIENTES,
} from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns-insumos'; // We will create this file next

// ============================================
// COMPONENTE: FORMULARIO DE INGREDIENTE
// ============================================

interface FormularioIngredienteProps {
  ingrediente?: Ingrediente;
  onGuardar: (ingrediente: Omit<Ingrediente, 'id' | 'fechaActualizacion'>) => void;
  onCancelar: () => void;
}

function FormularioIngrediente({ ingrediente, onGuardar, onCancelar }: FormularioIngredienteProps) {
  const [formData, setFormData] = useState({
    nombre: ingrediente?.nombre || '',
    categoria: ingrediente?.categoria || CATEGORIAS_INGREDIENTES[0],
    unidadCompra: ingrediente?.unidadCompra || 'kg',
    costoUnitario: ingrediente?.costoUnitario || 0,
    proveedor: ingrediente?.proveedor || '',
    densidad: ingrediente?.densidad || 1, // Default 1 (Agua)
    activo: ingrediente?.activo ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(formData);
  };

  const DENSIDADES_COMUNES = [
    { nombre: 'Agua / Vinagre', valor: 1 },
    { nombre: 'Aceite', valor: 0.92 },
    { nombre: 'Leche', valor: 1.03 },
    { nombre: 'Harina Trigo', valor: 0.6 },
    { nombre: 'Azúcar', valor: 0.85 },
    { nombre: 'Mantequilla', valor: 0.91 },
    { nombre: 'Miel', valor: 1.42 },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Nombre *</label>
          <Input
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Aceite de Oliva"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Categoría</label>
          <Select
            value={formData.categoria}
            onValueChange={(value) => setFormData({ ...formData, categoria: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS_INGREDIENTES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Unidad de Compra</label>
          <Select
            value={formData.unidadCompra}
            onValueChange={(value: UnidadMedida) => setFormData({ ...formData, unidadCompra: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(UNIDADES).map(([key, unidad]) => (
                <SelectItem key={key} value={key}>
                  {unidad.nombre} ({key})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Costo Unitario</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.costoUnitario}
            onChange={(e) => setFormData({ ...formData, costoUnitario: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            required
          />
        </div>

        {/* Sección de Densidad */}
        <div className="space-y-2 md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-blue-900 flex items-center gap-2">
              Factor de Conversión (Densidad)
            </label>
            <span className="text-xs text-blue-600 bg-white px-2 py-1 rounded-full border border-blue-200">
              1 ml = {formData.densidad} g
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-blue-700 mb-2">Necesario para convertir entre Kilos y Litros.</p>
              <Input
                type="number"
                step="0.01"
                min="0.1"
                value={formData.densidad}
                onChange={(e) => setFormData({ ...formData, densidad: parseFloat(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-blue-700 mb-2">Valores Comunes (Click para aplicar):</p>
              <div className="flex flex-wrap gap-2">
                {DENSIDADES_COMUNES.map(d => (
                  <Button
                    key={d.nombre}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs bg-white text-blue-800 border-blue-200 hover:bg-blue-100"
                    onClick={() => setFormData(prev => ({ ...prev, densidad: d.valor }))}
                  >
                    {d.nombre} ({d.valor})
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Proveedor (opcional)</label>
          <Input
            value={formData.proveedor}
            onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
            placeholder="Nombre del proveedor"
          />
        </div>
      </div>

      <DialogFooter className="pt-4 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
          <Save className="w-4 h-4 mr-2" />
          Guardar
        </Button>
      </DialogFooter>
    </form>
  );
}

// ============================================
// COMPONENTE PRINCIPAL: VISTA INSUMOS
// ============================================

interface VistaInsumosProps {
  ingredientes: Ingrediente[];
  onAgregar: (ingrediente: Omit<Ingrediente, 'id' | 'fechaActualizacion'>) => void;
  onActualizar: (id: string, datos: Partial<Ingrediente>) => void;
  onEliminar: (id: string) => void;
}

export function VistaInsumos({
  ingredientes,
  onAgregar,
  onActualizar,
  onEliminar
}: VistaInsumosProps) {
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [ingredienteEditando, setIngredienteEditando] = useState<Ingrediente | undefined>();

  const handleGuardar = (datos: Omit<Ingrediente, 'id' | 'fechaActualizacion'>) => {
    if (ingredienteEditando) {
      onActualizar(ingredienteEditando.id, datos);
    } else {
      onAgregar(datos);
    }
    setDialogoAbierto(false);
    setIngredienteEditando(undefined);
  };

  const handleNuevo = () => {
    setIngredienteEditando(undefined);
    setDialogoAbierto(true);
  };

  const exportarCSV = () => {
    const headers = ['Nombre', 'Categoría', 'Unidad de Compra', 'Costo Unitario', 'Proveedor', 'Fecha Actualización'];
    const rows = ingredientes.map(ing => [
      ing.nombre,
      ing.categoria,
      UNIDADES[ing.unidadCompra].nombre,
      ing.costoUnitario.toString(),
      ing.proveedor || '',
      new Date(ing.fechaActualizacion).toLocaleDateString()
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'insumos-kitchenledger.csv';
    a.click();
  };

  // Memoize columns to pass handlers
  const tableColumns = useMemo(() => columns(onActualizar, onEliminar, (ingrediente) => {
    setIngredienteEditando(ingrediente);
    setDialogoAbierto(true);
  }), [onActualizar, onEliminar]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Base de Datos de Insumos</h1>
          <p className="text-gray-500">Gestiona los ingredientes y sus costos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportarCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleNuevo} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Insumo
          </Button>
        </div>
      </div>

      <DataTable columns={tableColumns} data={ingredientes} searchKey="nombre" />

      {/* Dialogo de formulario */}
      <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {ingredienteEditando ? 'Editar Insumo' : 'Nuevo Insumo'}
            </DialogTitle>
            <DialogDescription>
              {ingredienteEditando
                ? 'Modifica los datos del insumo'
                : 'Ingresa los datos del nuevo insumo'}
            </DialogDescription>
          </DialogHeader>
          <FormularioIngrediente
            ingrediente={ingredienteEditando}
            onGuardar={handleGuardar}
            onCancelar={() => setDialogoAbierto(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VistaInsumos;
