import { useState, useEffect } from 'react';
import {
    ChefHat,
    Plus,
    History,
    ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatCurrency } from '@/types';
import type { RegistroProduccion } from '@/types';
import { useDatabase } from '@/hooks/useDatabase';
import { toast } from 'sonner';

export function VistaProduccion() {
    const {
        recetas,
        registrarProduccion,
        fetchHistorialProduccion
    } = useDatabase();

    const [historial, setHistorial] = useState<RegistroProduccion[]>([]);
    const [recetaSeleccionada, setRecetaSeleccionada] = useState<string>('');
    const [cantidad, setCantidad] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cargar historial al montar
    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const data = await fetchHistorialProduccion();
        setHistorial(data);
    };

    const handleRegistrar = async () => {
        if (!recetaSeleccionada || !cantidad) {
            toast.error("Selecciona una receta y cantidad");
            return;
        }

        const receta = recetas.find(r => r.id === recetaSeleccionada);
        if (!receta) return;

        const cantidadNum = parseFloat(cantidad);
        if (isNaN(cantidadNum) || cantidadNum <= 0) {
            toast.error("Cantidad inválida");
            return;
        }

        setIsSubmitting(true);
        try {
            await registrarProduccion({
                recetaId: receta.id,
                cantidad: cantidadNum,
                costoUnitarioSnapshot: receta.costoTotal / receta.porciones, // Costo por porción
                costoTotal: (receta.costoTotal / receta.porciones) * cantidadNum
            });

            toast.success(`Producción de ${cantidadNum} ${receta.nombre} registrada`);
            setRecetaSeleccionada('');
            setCantidad('');
            loadHistory(); // Recargar tabla
        } catch (error) {
            toast.error("Error al registrar producción");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filtrar recetas activas
    const recetasActivas = recetas.filter(r => r.activa);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <ChefHat className="w-8 h-8 text-emerald-600" />
                        Bitácora de Producción
                    </h1>
                    <p className="text-gray-500">Registra lo que se cocina para calcular costos teóricos y existencias.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario de Registro */}
                <Card className="lg:col-span-1 border-emerald-100 shadow-lg bg-white/50 backdrop-blur-sm h-fit">
                    <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 pb-4">
                        <CardTitle className="text-emerald-800 flex items-center gap-2">
                            <Plus className="w-5 h-5" /> Nuevo Registro
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Receta / Sub-receta</label>
                                <Select value={recetaSeleccionada} onValueChange={setRecetaSeleccionada}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {recetasActivas.map(r => (
                                            <SelectItem key={r.id} value={r.id}>
                                                {r.nombre} ({formatCurrency(r.costoTotal / r.porciones)}/p)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Cantidad Producida (Porciones)</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={cantidad}
                                        onChange={e => setCantidad(e.target.value)}
                                        className="pl-4 text-lg font-semibold"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                        unidades
                                    </span>
                                </div>
                            </div>

                            {recetaSeleccionada && cantidad && !isNaN(parseFloat(cantidad)) && (
                                <div className="bg-emerald-50 p-4 rounded-lg space-y-2 border border-emerald-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-emerald-700">Costo Estimado:</span>
                                        <span className="font-bold text-emerald-900">
                                            {(() => {
                                                const r = recetas.find(r => r.id === recetaSeleccionada);
                                                if (!r) return '$0.00';
                                                const total = (r.costoTotal / r.porciones) * parseFloat(cantidad);
                                                return formatCurrency(total);
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleRegistrar}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 h-12 text-lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Guardando...' : 'Registrar Producción'}
                                {!isSubmitting && <ArrowRight className="w-5 h-5 ml-2" />}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Historial */}
                <Card className="lg:col-span-2 border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
                            <History className="w-5 h-5 text-gray-500" /> Historial Reciente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Receta</TableHead>
                                    <TableHead className="text-center">Cant.</TableHead>
                                    <TableHead className="text-right">Costo Unit.</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historial.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                            No hay registros de producción aún.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    historial.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium text-gray-600">
                                                {new Date(item.fecha).toLocaleDateString()} <br />
                                                <span className="text-xs text-gray-400">{new Date(item.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold text-gray-900">{item.nombreReceta}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary">{item.cantidadProducida}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-gray-500 font-mono text-xs">
                                                {formatCurrency(item.costoUnitarioSnapshot)}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-gray-900">
                                                {formatCurrency(item.costoTotal)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
