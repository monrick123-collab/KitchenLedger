import {
  DollarSign,
  ChefHat,
  Package,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Receta } from '@/types';
import {
  formatCurrency,
  formatPercent,
  getIndicadorRentabilidad
} from '@/types';
import { useDatabase } from '@/hooks/useDatabase';

// ============================================
// COMPONENTE: INDICADOR SEMÁFORO
// ============================================

interface SemaforoProps {
  costo: number;
  precioVenta: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function Semaforo({ costo, precioVenta, size = 'md', showLabel = true }: SemaforoProps) {
  const indicador = getIndicadorRentabilidad(costo, precioVenta);
  const porcentaje = precioVenta > 0 ? (costo / precioVenta) * 100 : 0;

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const labelClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const colors = {
    verde: 'bg-emerald-500',
    amarillo: 'bg-amber-400',
    rojo: 'bg-red-500'
  };

  const labels = {
    verde: 'Óptimo',
    amarillo: 'Regular',
    rojo: 'Crítico'
  };

  const textColors = {
    verde: 'text-emerald-600',
    amarillo: 'text-amber-600',
    rojo: 'text-red-600'
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} rounded-full ${colors[indicador]} shadow-sm`} />
      {showLabel && (
        <span className={`${labelClasses[size]} font-medium ${textColors[indicador]}`}>
          {labels[indicador]} ({formatPercent(porcentaje)})
        </span>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE: TARJETA DE RECETA
// ============================================

interface RecetaCardProps {
  receta: Receta;
  onClick?: () => void;
}

function RecetaCard({ receta, onClick }: RecetaCardProps) {
  // Porcentaje de costo calculado para referencia

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-gray-200 group"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
              {receta.nombre}
            </h3>
            <p className="text-sm text-gray-500">{receta.categoria}</p>
          </div>
          <Semaforo costo={receta.costoTotal} precioVenta={receta.precioVenta} size="sm" showLabel={false} />
        </div>

        {receta.imagen && (
          <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-gray-100">
            <img
              src={receta.imagen}
              alt={receta.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Costo Total</span>
            <span className="font-semibold text-gray-900">{formatCurrency(receta.costoTotal)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Precio Venta</span>
            <span className="font-semibold text-emerald-600">{formatCurrency(receta.precioVenta)}</span>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Margen</span>
              <span className={`text-xs font-medium ${receta.margenGanancia >= 65 ? 'text-emerald-600' : receta.margenGanancia >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {formatPercent(receta.margenGanancia)}
              </span>
            </div>
            <Progress
              value={Math.min(receta.margenGanancia, 100)}
              className="h-1.5"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-400">{receta.porciones} porciones</span>
            <span className="text-xs text-gray-400">
              {formatCurrency(receta.costoTotal / receta.porciones)} / porción
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPONENTE: ESTADÍSTICA
// ============================================

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: 'emerald' | 'blue' | 'amber' | 'red' | 'purple';
}

function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color }: StatCardProps) {
  // Colores para las tarjetas de estadísticas

  const bgColorClasses = {
    emerald: 'bg-emerald-50',
    blue: 'bg-blue-50',
    amber: 'bg-amber-50',
    red: 'bg-red-50',
    purple: 'bg-purple-50'
  };

  const iconColorClasses = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
  };

  return (
    <Card className="border-gray-200 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}

            {trend && trendValue && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> :
                  trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl ${bgColorClasses[color]} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPONENTE PRINCIPAL: DASHBOARD
// ============================================

interface DashboardProps {
  onVerReceta: (recetaId: string) => void;
  onNuevaReceta: () => void;
}

export function Dashboard({ onVerReceta, onNuevaReceta }: DashboardProps) {
  const { recetas, getEstadisticas, isLoading, inicializarBaseDeDatos } = useDatabase();
  const estadisticas = getEstadisticas();

  // Ordenar recetas por margen de ganancia (mejores primero)
  const recetasOrdenadas = [...recetas].sort((a, b) => b.margenGanancia - a.margenGanancia);

  // Recetas con problemas (margen < 50%)
  const recetasProblematicas = recetas.filter(r => r.margenGanancia < 50);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Resumen de tu restaurante</p>
        </div>
        <div className="flex gap-2">
          {estadisticas.totalIngredientes === 0 && (
            <button
              onClick={inicializarBaseDeDatos}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium border border-blue-700"
            >
              <Package className="w-4 h-4" />
              Cargar Datos Ejemplo
            </button>
          )}
          <button
            onClick={onNuevaReceta}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            <ChefHat className="w-4 h-4" />
            Nueva Receta
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Recetas"
          value={estadisticas.totalRecetas.toString()}
          subtitle={`${estadisticas.recetasActivas} activas`}
          icon={ChefHat}
          color="emerald"
        />
        <StatCard
          title="Ingredientes"
          value={estadisticas.totalIngredientes.toString()}
          subtitle={`${estadisticas.ingredientesActivos} activos`}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Costo Promedio"
          value={formatCurrency(estadisticas.costoPromedio)}
          subtitle="por receta"
          icon={DollarSign}
          color="amber"
        />
        <StatCard
          title="Margen Promedio"
          value={formatPercent(estadisticas.margenPromedio)}
          subtitle={`${estadisticas.recetasRentables} recetas óptimas`}
          icon={Target}
          trend={estadisticas.margenPromedio >= 65 ? 'up' : estadisticas.margenPromedio >= 50 ? 'neutral' : 'down'}
          trendValue={estadisticas.margenPromedio >= 65 ? 'Excelente' : estadisticas.margenPromedio >= 50 ? 'Regular' : 'Necesita atención'}
          color={estadisticas.margenPromedio >= 65 ? 'emerald' : estadisticas.margenPromedio >= 50 ? 'amber' : 'red'}
        />
      </div>

      {/* Alertas */}
      {recetasProblematicas.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Recetas con margen bajo</h3>
              <p className="text-sm text-red-700 mt-1">
                Tienes {recetasProblematicas.length} receta(s) con margen menor al 50%.
                Considera ajustar precios o reducir costos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recetas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Tus Recetas</h2>
          <span className="text-sm text-gray-500">{recetas.length} total</span>
        </div>

        {recetas.length === 0 ? (
          <Card className="border-gray-200 border-dashed">
            <CardContent className="p-8 text-center">
              <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1">No hay recetas</h3>
              <p className="text-sm text-gray-500 mb-4">Comienza creando tu primera receta</p>
              <button
                onClick={onNuevaReceta}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Crear Receta
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {recetasOrdenadas.map((receta) => (
              <RecetaCard
                key={receta.id}
                receta={receta}
                onClick={() => onVerReceta(receta.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Leyenda del semáforo */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700">Indicador de Rentabilidad</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm text-gray-600">Óptimo (&lt;30% del precio)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-sm text-gray-600">Regular (30-35% del precio)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600">Crítico (&gt;35% del precio)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
