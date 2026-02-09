import {
  LayoutDashboard,
  Package,
  ChefHat,
  TrendingUp,
  Menu,
  X,
  Trash2,
  UtensilsCrossed
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Vista, RolUsuario } from '@/types';

interface NavigationProps {
  vistaActual: Vista;
  onCambiarVista: (vista: Vista) => void;
  rolUsuario: RolUsuario;
  menuAbierto: boolean;
  onToggleMenu: () => void;
}

const navItems: { vista: Vista; label: string; icon: React.ElementType; roles: RolUsuario[] }[] = [
  { vista: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'contador', 'chef'] },
  { vista: 'insumos', label: 'Insumos', icon: Package, roles: ['admin', 'contador'] },
  { vista: 'recetas', label: 'Recetas', icon: ChefHat, roles: ['admin', 'chef'] },
  { vista: 'produccion', label: 'Producción', icon: TrendingUp, roles: ['admin', 'chef'] },
  { vista: 'mermas', label: 'Mermas', icon: Trash2, roles: ['admin', 'chef'] },
  { vista: 'ventas', label: 'Ventas', icon: UtensilsCrossed, roles: ['admin', 'chef', 'contador'] },
];

export function Navigation({
  vistaActual,
  onCambiarVista,
  rolUsuario,
  menuAbierto,
  onToggleMenu
}: NavigationProps) {
  const itemsFiltrados = navItems.filter(item => item.roles.includes(rolUsuario));

  return (
    <>
      {/* Header móvil */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">KitchenLedger</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMenu}
          className="lg:hidden"
        >
          {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </header>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex-col z-50">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-gray-900 block">KitchenLedger</span>
              <span className="text-xs text-gray-500 capitalize">{rolUsuario}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4">
          <ul className="space-y-2">
            {itemsFiltrados.map((item) => {
              const Icon = item.icon;
              const isActive = vistaActual === item.vista;
              return (
                <li key={item.vista}>
                  <button
                    onClick={() => onCambiarVista(item.vista)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                      ${isActive
                        ? 'bg-emerald-50 text-emerald-700 font-medium shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Tip del día</span>
            </div>
            <p className="text-xs text-emerald-100">
              Mantén tus costos por debajo del 30% del precio de venta para maximizar ganancias.
            </p>
          </div>
        </div>
      </aside>

      {/* Menú móvil */}
      {menuAbierto && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onToggleMenu}
          />
          <nav className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-xl">
            <ul className="p-4 space-y-2">
              {itemsFiltrados.map((item) => {
                const Icon = item.icon;
                const isActive = vistaActual === item.vista;
                return (
                  <li key={item.vista}>
                    <button
                      onClick={() => {
                        onCambiarVista(item.vista);
                        onToggleMenu();
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                        ${isActive
                          ? 'bg-emerald-50 text-emerald-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}

export default Navigation;
