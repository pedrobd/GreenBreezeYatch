"use client";

import { useState, useTransition, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Utensils, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { FoodActionsCell } from "./food-actions-cell";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { reorderFoodAction } from "@/app/actions/food";
import { toast } from "sonner";

interface FoodItem {
    id: string;
    name: string;
    category: string;
    dietary_info: string;
    stock: number;
    status: "Disponível" | "Esgotado" | "Indisponível";
    price: number | string;
    image_url: string;
    sort_order?: number;
}

interface FoodTableProps {
    items: FoodItem[];
}

function SortableRow({ item }: { item: FoodItem }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: 'relative' as const,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            className={cn(
                "group border-white/10 transition-colors",
                isDragging ? "bg-white/60 cursor-grabbing border-[#44C3B2]/30 shadow-sm" : "hover:bg-white/30"
            )}
        >
            <TableCell className="py-4 px-4 w-[40px]">
                <div
                    {...attributes}
                    {...listeners}
                    className="p-2 cursor-grab active:cursor-grabbing hover:bg-[#0A1F1C]/5 rounded-lg transition-colors"
                >
                    <GripVertical className="h-4 w-4 text-[#0A1F1C]/30 group-hover:text-[#0A1F1C]/60" />
                </div>
            </TableCell>
            <TableCell className="py-4 px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/40 bg-[#0A1F1C] text-[#44C3B2] overflow-hidden shadow-lg shadow-[#0A1F1C]/10 transition-transform group-hover:scale-110">
                    {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                        <Utensils className="h-5 w-5" />
                    )}
                </div>
            </TableCell>
            <TableCell>
                <div className="flex flex-col">
                    <span className="font-bold text-[#0A1F1C] font-body text-sm leading-none mb-0.5">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground font-body uppercase tracking-tighter">SKU: FOOD-{item.id.slice(0, 4)}</span>
                </div>
            </TableCell>
            <TableCell className="whitespace-nowrap px-4">
                <span className="text-xs font-bold text-[#0A1F1C]/60 font-body">{item.category}</span>
            </TableCell>
            <TableCell>
                <span className="text-[10px] font-bold text-[#44C3B2] uppercase tracking-[0.1em] font-body">{item.dietary_info || "Geral"}</span>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0A1F1C]/80 font-body text-sm tabular-nums">{item.stock > 900 ? "Livre" : item.stock}</span>
                    <span className="text-[10px] font-black text-[#0A1F1C]/30 uppercase tracking-widest font-body">{item.stock > 900 ? "Unidades" : "Sobra"}</span>
                </div>
            </TableCell>
            <TableCell>
                <Badge
                    className={cn(
                        "border-white/20 transition-all",
                        item.status === "Disponível"
                            ? "bg-[#44C3B2]/10 text-[#44C3B2] border-[#44C3B2]/20 hover:bg-[#44C3B2]/20"
                            : item.status === "Esgotado"
                                ? "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
                    )}
                    variant="outline"
                >
                    <span className={cn(
                        "h-1.5 w-1.5 rounded-full mr-2",
                        item.status === "Disponível" ? "bg-[#44C3B2] animate-pulse" : item.status === "Esgotado" ? "bg-red-500" : "bg-amber-500"
                    )} />
                    {item.status}
                </Badge>
            </TableCell>
            <TableCell className="text-right py-4 px-8 font-body font-bold text-[#0A1F1C] text-sm tabular-nums">
                €{Number(item.price).toFixed(2)}
            </TableCell>
            <TableCell className="py-4 px-4 text-right">
                <FoodActionsCell item={item} />
            </TableCell>
        </TableRow>
    );
}

export function FoodTable({ items: initialItems }: FoodTableProps) {
    const [items, setItems] = useState(initialItems);
    const [isPending, startTransition] = useTransition();

    // Sync local state when initialItems change (e.g. category switch)
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            const newItems = arrayMove(items, oldIndex, newIndex);
            setItems(newItems);

            // Persist order
            startTransition(async () => {
                const reorderedData = newItems.map((item, index) => ({
                    id: item.id,
                    sort_order: index,
                }));
                const result = await reorderFoodAction(reorderedData);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Ordem atualizada!");
                }
            });
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
        >
            <div className="overflow-x-auto w-full">
                <Table className="min-w-full">
                    <TableHeader className="bg-[#0A1F1C]/5">
                        <TableRow className="hover:bg-transparent border-white/20">
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead className="w-[100px] font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6 px-8">Imagem</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Nome do Artigo</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Categoria</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Dietética</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Disponibilidade</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6">Estado</TableHead>
                            <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-[#0A1F1C]/50 py-6 px-8">Preço</TableHead>
                            <TableHead className="w-[80px] py-6 px-8"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            {items.length > 0 ? (
                                items.map((item) => (
                                    <SortableRow key={item.id} item={item} />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <Utensils className="h-10 w-10 text-[#0A1F1C]" />
                                            <p className="font-heading font-bold text-[#0A1F1C]">Nenhum artigo encontrado nesta categoria</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </SortableContext>
                    </TableBody>
                </Table>
            </div>
        </DndContext>
    );
}
