import type { ColumnDef } from "@tanstack/react-table"
import { UNIDADES, formatCurrency } from "@/types"
import type { Ingrediente } from "@/types"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"

export const columns = (
    onEdit: (id: string, datos: Partial<Ingrediente>) => void,
    onDelete: (id: string) => void,
    onEditFull: (ingrediente: Ingrediente) => void
): ColumnDef<Ingrediente>[] => [
        {
            accessorKey: "nombre",
            header: "Nombre",
            cell: ({ row }) => <div className="font-medium">{row.getValue("nombre")}</div>,
        },
        {
            accessorKey: "categoria",
            header: "Categoría",
        },
        {
            accessorKey: "costoUnitario",
            header: "Costo",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("costoUnitario"))
                const unidad = UNIDADES[row.original.unidadCompra].nombre
                return <div>{formatCurrency(amount)} / {unidad}</div>
            },
        },
        {
            accessorKey: "densidad",
            header: "Densidad",
            cell: ({ row }) => {
                const densidad = row.original.densidad || 1
                return <div className="text-gray-500">{densidad} g/ml</div>
            },
        },
        {
            accessorKey: "proveedor",
            header: "Proveedor",
        },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditFull(row.original)}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => onDelete(row.original.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )
            },
        },
    ]
