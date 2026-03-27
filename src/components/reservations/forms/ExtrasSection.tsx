import { useFormContext, useWatch } from "react-hook-form";
import { Plus, Minus, X } from "lucide-react";
import {
    FormControl,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BoatExtra, FoodItem, ReservationFormValues } from "@/types/admin";

interface ExtrasSectionProps {
    boatExtras: BoatExtra[];
    availableFood: FoodItem[];
}

export function ExtrasSection({
    boatExtras,
    availableFood
}: ExtrasSectionProps) {
    const { control, setValue } = useFormContext<ReservationFormValues>();
    const selectedActivities = useWatch({ control, name: "selected_activities" }) || [];
    const selectedFood = useWatch({ control, name: "selected_food" }) || [];

    return (
        <div className="space-y-6">
            {/* Activities Section */}
            <div className="space-y-4 pt-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40 flex items-center gap-2">
                    <Plus className="h-3 w-3" /> Seleção de Atividades Extra
                </h4>
                <div className="space-y-3">
                    <Select onValueChange={(val) => {
                        if (!selectedActivities.find(a => a.id === val)) {
                            setValue("selected_activities", [...selectedActivities, { id: val, quantity: 1 }]);
                        }
                    }}>
                        <SelectTrigger className="rounded-xl border-white/50 bg-white/50">
                            <SelectValue placeholder="Adicionar Extra..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                            {boatExtras.map(a => (
                                <SelectItem key={a.id} value={a.id}>{a.name} (€{a.price})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex flex-wrap gap-2">
                        {selectedActivities.map((item) => {
                            const activity = boatExtras.find(e => e.id === item.id);
                            return (
                                <Badge key={item.id} variant="secondary" className="pl-3 pr-1 py-1 h-auto flex items-center gap-2 rounded-full bg-white/80 border-white/50 text-[#0A1F1C]">
                                    <span className="text-[11px] font-bold">{activity?.name || "Extra"}</span>
                                    <div className="flex items-center bg-[#0A1F1C]/5 rounded-full px-1">
                                        <button type="button" onClick={() => {
                                            const next = selectedActivities.map(a =>
                                                a.id === item.id ? { ...a, quantity: Math.max(1, a.quantity - 1) } : a
                                            );
                                            setValue("selected_activities", next);
                                        }} className="h-5 w-5 flex items-center justify-center hover:text-[#44C3B2]"><Minus className="h-3 w-3" /></button>
                                        <span className="text-[10px] w-4 text-center">{item.quantity}</span>
                                        <button type="button" onClick={() => {
                                            const next = selectedActivities.map(a =>
                                                a.id === item.id ? { ...a, quantity: a.quantity + 1 } : a
                                            );
                                            setValue("selected_activities", next);
                                        }} className="h-5 w-5 flex items-center justify-center hover:text-[#44C3B2]"><Plus className="h-3 w-3" /></button>
                                    </div>
                                    <button type="button" onClick={() => {
                                        setValue("selected_activities", selectedActivities.filter(a => a.id !== item.id));
                                    }} className="h-5 w-5 rounded-full hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Food Section */}
            <div className="space-y-4 pt-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/40 flex items-center gap-2">
                    <Plus className="h-3 w-3" /> Seleção de Refeições / Catering
                </h4>
                <div className="space-y-3">
                    <Select onValueChange={(val) => {
                        if (!selectedFood.find(f => f.id === val)) {
                            setValue("selected_food", [...selectedFood, { id: val, quantity: 1 }]);
                        }
                    }}>
                        <SelectTrigger className="rounded-xl border-white/50 bg-white/50">
                            <SelectValue placeholder="Adicionar Refeição..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl">
                            {availableFood.map(f => (
                                <SelectItem key={f.id} value={f.id}>{f.name} (€{f.price})</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex flex-wrap gap-2">
                        {selectedFood.map((item) => {
                            const food = availableFood.find(f => f.id === item.id);
                            return (
                                <Badge key={item.id} variant="secondary" className="pl-3 pr-1 py-1 h-auto flex items-center gap-2 rounded-full bg-white/80 border-white/50 text-[#0A1F1C]">
                                    <span className="text-[11px] font-bold">{food?.name || "Refeição"}</span>
                                    <div className="flex items-center bg-[#0A1F1C]/5 rounded-full px-1">
                                        <button type="button" onClick={() => {
                                            const next = selectedFood.map(f =>
                                                f.id === item.id ? { ...f, quantity: Math.max(1, f.quantity - 1) } : f
                                            );
                                            setValue("selected_food", next);
                                        }} className="h-5 w-5 flex items-center justify-center hover:text-[#44C3B2]"><Minus className="h-3 w-3" /></button>
                                        <span className="text-[10px] w-4 text-center">{item.quantity}</span>
                                        <button type="button" onClick={() => {
                                            const next = selectedFood.map(f =>
                                                f.id === item.id ? { ...f, quantity: f.quantity + 1 } : f
                                            );
                                            setValue("selected_food", next);
                                        }} className="h-5 w-5 flex items-center justify-center hover:text-[#44C3B2]"><Plus className="h-3 w-3" /></button>
                                    </div>
                                    <button type="button" onClick={() => {
                                        setValue("selected_food", selectedFood.filter(f => f.id !== item.id));
                                    }} className="h-5 w-5 rounded-full hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
