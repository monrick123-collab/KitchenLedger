import { useState, useEffect } from 'react';
import {
    Trash2,
    Save,
    Clock,
    AlertTriangle
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
import { Textarea } from '@/components/ui/textarea';
import { useDatabase } from '@/hooks/useDatabase';
import { formatCurrency, formatFecha } from '@/types';
import { toast } from 'sonner';

export function VistaMermas() {
    const { recetas, registrarMerma, fetchHistorialProduccion } = useDatabase();
    const [recetaSeleccionada, setRecetaSeleccionada] = useState<string>('');
    const [cantidad, setCantidad] = useState<number>(1);
    const [motivo, setMotivo] = useState<string>('');
    const [historial, setHistorial] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const loadHistory = async () => {
        const data = await fetchHistorialProduccion();
        setHistorial(data.filter((item: any) => item.tipo === 'MERMA'));
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const handleRegistrar = async () => {
        if (!recetaSeleccionada || cantidad <= 0 || !motivo) return;

        const receta = recetas.find(r => r.id === recetaSeleccionada);
        if (!receta) return;

        setLoading(true);
        try {
            await registrarMerma({
                recetaId: receta.id,
                cantidad,
                costoUnitarioSnapshot: receta.costoTotal / receta.porciones, // Costo por porción
                costoTotal: (receta.costoTotal / receta.porciones) * cantidad,
                motivo
            });

            toast.success('Merma registrada correctamente');
            setRecetaSeleccionada('');
            setCantidad(1);
            setMotivo('');
            loadHistory();
        } catch (error) {
            toast.error('Error al registrar merma');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const recetaActual = recetas.find(r => r.id === recetaSeleccionada);
    const costoEstimado = recetaActual
        ? (recetaActual.costoTotal / recetaActual.porciones) * cantidad
        : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-red-700 flex items-center gap-2">
                        <Trash2 className="w-8 h-8" />
                        Bitácora de Mermas
                    </h1>
                    <p className="text-gray-500">
                        Registra los desperdicios y platillos no vendidos para controlar pérdidas.
                    </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm max-w-md">
                    <p className="font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Control de Pérdidas
                    </p>
                    Identificar las causas de mermas te ayudará a reducir costos operativos.
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario */}
                <Card className="lg:col-span-1 h-fit border-red-100 shadow-md">
                    <CardHeader className="bg-gradient-to-br from-red-50 to-white">
                        <CardTitle className="text-red-800">Registrar Desperdicio</CardTitle>
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
                                min="0.5"
                                step="0.5"
                                value={cantidad}
                                onChange={(e) => setCantidad(parseFloat(e.target.value))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Motivo de la Merma</Label>
                            <Textarea
                                placeholder="Ej. Se quemó, Se cayó, Caducado..."
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                rows={2}
                            />
                        </div>

                        {recetaActual && (
                            <div className="bg-red-50 p-3 rounded-lg space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Costo Unitario:</span>
                                    <span className="font-medium">{formatCurrency(recetaActual.costoTotal / recetaActual.porciones)}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-red-700 pt-2 border-t border-red-100">
                                    <span>Pérdida Total:</span>
                                    <span>{formatCurrency(costoEstimado)}</span>
                                </div>
                            </div>
                        )}

                        <Button
                            className="w-full bg-red-600 hover:bg-red-700"
                            onClick={handleRegistrar}
                            disabled={!recetaSeleccionada || loading || !motivo}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Registrar Pérdida
                        </Button>
                    </CardContent>
                </Card>

                {/* Historial */}
                <Card className="lg:col-span-2 border-gray-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-500" />
                            Historial de Mermas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <div className="bg-gray-50 p-3 grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                                <div className="col-span-3">Fecha</div>
                                <div className="col-span-3">Platillo</div>
                                <div className="col-span-3">Motivo</div>
                                <div className="col-span-1 text-center">Cant.</div>
                                <div className="col-span-2 text-right">Pérdida</div>
                            </div>
                            <div className="divide-y max-h-[500px] overflow-y-auto">
                                {historial.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No hay registros de mermas recientes
                                    </div>
                                ) : (
                                    historial.map((item) => (
                                        <div key={item.id} className="p-3 grid grid-cols-12 gap-4 text-sm items-center hover:bg-gray-50">
                                            <div className="col-span-3 text-gray-600">{formatFecha(item.fecha)}</div>
                                            <div className="col-span-3 font-medium text-gray-900">{item.nombreReceta}</div>
                                            <div className="col-span-3 text-gray-600 italic truncate" title={item.motivo}>{item.motivo}</div>
                                            <div className="col-span-1 text-center bg-red-100 text-red-700 rounded-full px-2 py-0.5 text-xs font-bold w-fit mx-auto">
                                                {item.cantidadProducida}
                                            </div>
                                            <div className="col-span-2 text-right font-medium text-red-600">
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
