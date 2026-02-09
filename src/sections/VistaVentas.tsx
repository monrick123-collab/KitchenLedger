import { useState, useEffect } from 'react';
import {
    UtensilsCrossed,
    Save,
    Clock,
    TrendingUp,
    DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useDatabase } from '@/hooks/useDatabase';
import { formatCurrency, formatFecha } from '@/types';
import { toast } from 'sonner';

export function VistaVentas() {
    const { recetas, registrarVenta, fetchHistorialProduccion } = useDatabase();
    const [recetaSeleccionada, setRecetaSeleccionada] = useState<string>('');
    const [cantidad, setCantidad] = useState<number>(1);
    const [historial, setHistorial] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadHistory = async () => {
        const data = await fetchHistorialProduccion();
        setHistorial(data.filter((item: any) => item.tipo === 'VENTA'));
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleRegistrar = async () => {
        if (!recetaSeleccionada || cantidad <= 0) return;

        const receta = recetas.find(r => r.id === recetaSeleccionada);
        if (!receta) return;

        setLoading(true);
        try {
            await registrarVenta({
                recetaId: receta.id,
                cantidad,
                costoUnitarioSnapshot: receta.costoTotal / receta.porciones,
                costoTotal: (receta.costoTotal / receta.porciones) * cantidad
            });

            toast.success('Venta registrada correctamente');
            setRecetaSeleccionada('');
            setCantidad(1);
            loadHistory();
        } catch (error) {
            toast.error('Error al registrar venta');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const recetaActual = recetas.find(r => r.id === recetaSeleccionada);
    const costoTotal = recetaActual
        ? (recetaActual.costoTotal / recetaActual.porciones) * cantidad
        : 0;

    // Precio de venta estimado (basado en receta)
    const ventaTotalEstimada = recetaActual
        ? (recetaActual.precioVenta / recetaActual.porciones) * cantidad // Asumiendo precioVenta es por receta completa? Wait, Receta interface says precioVenta. Usually per portion? 
        // Types: precioVenta: number. FormularioReceta: precioVenta set manually. Usually it's Unit Price per portion? 
        // In Receta interface: "precioVenta: number". In Dashboard: "r.precioVenta". In Form calculator: "Precio de Venta".
        // If "porciones" > 1, usually price is per Portion.
        // Let's assume precioVenta in Receta is PER PORTION? No, FormularioReceta shows "Precio de Venta" next to Costo Total (which is total).
        // Let's check FormularioReceta again.
        // "Costo Total" (sum of ingredients). "Costo por porcion" = Total / Porciones.
        // "Precio de Venta" input.
        // "Margen" = (Precio - CostoTotal) / Precio.
        // This implies PrecioVenta is TOTAL for the whole batch?
        // If I make a batch of 10 liters of sauce, Price is for 10 liters?
        // Usually restaurants price by DISH (Portion).
        // BUT the recipe form looks like it calculates margin based on TOTALS.
        // If I have 1 portion, correct.
        // If I have 10 portions, and Price is 100, Cost is 30.
        // This is ambiguous.
        // However, in `VistaVentas`, we are registering "Cantidad" (servings).
        // If the recipe is "Salsa 10L", and I serve 0.1 (1 serving).
        // I need to know the price PER SERVING.
        // Let's assume for now Price in Receta is TOTAL for the Batch.
        // So Price Per Serving = r.precioVenta / r.porciones.
        : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                        <UtensilsCrossed className="w-8 h-8" />
                        Bitácora de Ventas
                    </h1>
                    <p className="text-gray-500">
                        Registra los platillos servidos para comparar contra la producción.
                    </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-700 text-sm max-w-md">
                    <p className="font-semibold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Control de Salidas
                    </p>
                    Registra cada platillo que sale de cocina a la mesa.
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario */}
                <Card className="lg:col-span-1 h-fit border-blue-100 shadow-md">
                    <CardHeader className="bg-gradient-to-br from-blue-50 to-white">
                        <CardTitle className="text-blue-800">Registrar Venta/Servicio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="space-y-2">
                            <Label>Platillo / Receta</Label>
                            <Select value={recetaSeleccionada} onValueChange={setRecetaSeleccionada}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {recetas.filter(r => r.activa).map((receta) => (
                                        <SelectItem key={receta.id} value={receta.id}>
                                            {receta.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Cantidad (Porciones)</Label>
                            <Input
                                type="number"
                                min="1"
                                step="1"
                                value={cantidad}
                                onChange={(e) => setCantidad(parseFloat(e.target.value))}
                            />
                        </div>

                        {recetaActual && (
                            <div className="bg-blue-50 p-3 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Costo Estimado:</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(costoTotal)}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-blue-700 pt-2 border-t border-blue-100">
                                    <span>Venta Estimada (Teórica):</span>
                                    <span>{formatCurrency(
                                        (recetaActual.precioVenta / recetaActual.porciones) * cantidad
                                    )}</span>
                                </div>
                            </div>
                        )}

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={handleRegistrar}
                            disabled={!recetaSeleccionada || loading}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Registrar Salida
                        </Button>
                    </CardContent>
                </Card>

                {/* Historial */}
                <Card className="lg:col-span-2 border-gray-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-500" />
                            Historial de Ventas (Turno Actual)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <div className="bg-gray-50 p-3 grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                                <div className="col-span-3">Fecha/Hora</div>
                                <div className="col-span-5">Platillo</div>
                                <div className="col-span-2 text-center">Cant.</div>
                                <div className="col-span-2 text-right">Costo</div>
                            </div>
                            <div className="divide-y max-h-[500px] overflow-y-auto">
                                {historial.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No hay registros de ventas recientes
                                    </div>
                                ) : (
                                    historial.map((item) => (
                                        <div key={item.id} className="p-3 grid grid-cols-12 gap-4 text-sm items-center hover:bg-gray-50">
                                            <div className="col-span-3 text-gray-600">{formatFecha(item.fecha)}</div>
                                            <div className="col-span-5 font-medium text-gray-900">{item.nombreReceta}</div>
                                            <div className="col-span-2 text-center bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-bold w-fit mx-auto">
                                                {item.cantidadProducida}
                                            </div>
                                            <div className="col-span-2 text-right font-medium text-gray-600">
                                                {formatCurrency(item.costoTotal)}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
