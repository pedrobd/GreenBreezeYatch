import { useState, useEffect, useRef } from "react";
import { getBoatProgramsAction, getBoatExtrasAction } from "@/app/actions/fleet";
import { getExtrasAction } from "@/app/actions/extras";
import { UseFormReturn } from "react-hook-form";
import { ReservationFormValues, Boat, BoatProgram, BoatExtra, FoodItem } from "@/types/admin";

/** Minimal shape of a selected activity or food item in the form. */
interface SelectedItem {
    id: string;
    quantity: number;
}

interface UseReservationPricingProps {
    form: UseFormReturn<ReservationFormValues>;
    selectedBoatId: string;
    selectedDate: string;
    selectedProgramId: string;
    selectedExtras: SelectedItem[];
    selectedFood: SelectedItem[];
    selectedBoardingLocation: string;
    totalPassengers: number;
    isPartner: boolean;
    selectedBoat: Boat | null;
    availableFood: FoodItem[];
    enabled?: boolean;
    isEdit?: boolean;
}

export function useReservationPricing({
    form,
    selectedBoatId,
    selectedDate,
    selectedProgramId,
    selectedExtras,
    selectedFood,
    selectedBoardingLocation,
    totalPassengers,
    isPartner,
    selectedBoat,
    availableFood,
    enabled = true,
    isEdit = false
}: UseReservationPricingProps) {
    const [boatPrograms, setBoatPrograms] = useState<BoatProgram[]>([]);
    const [boatExtras, setBoatExtras] = useState<BoatExtra[]>([]);
    const [season, setSeason] = useState<'low' | 'mid' | 'high'>('low');
    const [isInitialized, setIsInitialized] = useState(false);
    const isFirstCalculation = useRef(true);

    // Reset initialization when hook is disabled
    useEffect(() => {
        if (!enabled) {
            setIsInitialized(false);
            isFirstCalculation.current = true;
        }
    }, [enabled]);

    // Track initialization to avoid overwriting on first load in edit mode
    useEffect(() => {
        if (enabled && !isInitialized) {
            setIsInitialized(true);
        }
    }, [enabled, isInitialized]);

    // Fetch Programs & Extras when Boat changes
    useEffect(() => {
        if (!enabled) return;
        if (selectedBoatId) {
            getBoatProgramsAction(selectedBoatId).then(res => setBoatPrograms((res.data as BoatProgram[]) || []));

            // Fetch all types of extras: boat-specific and global extras
            Promise.all([
                getBoatExtrasAction(selectedBoatId),
                getExtrasAction()
            ]).then(([boatRes, globalRes]) => {
                const combined: BoatExtra[] = [
                    ...((boatRes.data as BoatExtra[]) || []),
                    ...((globalRes.data as BoatExtra[]) || [])
                ];
                setBoatExtras(combined);
            });
        } else {
            setBoatPrograms([]);
            setBoatExtras([]);
        }
    }, [selectedBoatId, enabled]);

    // Calculate Season
    useEffect(() => {
        if (!enabled || !selectedDate) return;
        const month = new Date(selectedDate).getMonth(); // 0-11
        let s: 'low' | 'mid' | 'high' = 'low';
        if ([5, 6, 7, 8].includes(month)) s = 'high';
        else if ([3, 4, 9].includes(month)) s = 'mid';
        setSeason(s);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.setValue("season_applied" as any, s);
    }, [selectedDate, form, enabled]);

    // Auto-calculate total amount and VAT
    useEffect(() => {
        if (!enabled) return;

        // Don't recalculate if we are waiting for boat-specific data
        const isDataLoaded = (selectedProgramId ? boatPrograms.length > 0 : true);

        if (!isDataLoaded) return;

        const program = boatPrograms.find(p => p.id === selectedProgramId);
        let baseGross = 0;
        let vatBase = 0;

        if (program) {
            // Safe access using season string
            const priceKey = `price_${season}` as keyof BoatProgram;
            baseGross = (program[priceKey] as number) || 0;
            const vatRate = program.vat_rate || 23;
            vatBase = baseGross - (baseGross / (1 + (vatRate / 100)));
        } else if (selectedBoat) {
            // Fallback to boat base price if no program is selected
            baseGross = selectedBoat.base_price || 0;
            vatBase = baseGross - (baseGross / 1.23);
        }

        const locationSurcharge = (!isPartner && selectedBoardingLocation === "Setúbal") ? (selectedBoat?.setubal_surcharge || 50) : 0;
        baseGross += locationSurcharge;

        let extrasGross = 0;
        let vatExtras = 0;

        // Calculate Extras (merged activities and boat extras)
        selectedExtras.forEach((curr) => {
            const extra = boatExtras.find(e => e.id === curr.id);
            if (extra) {
                // In backoffice, we should respect the manual quantity chosen
                // unless it's a website booking (handled differently)
                const qty = curr.quantity;
                const gross = (extra.price || 0) * qty;
                extrasGross += gross;
                const vatRate = extra.vat_rate || 23;
                vatExtras += gross - (gross / (1 + (vatRate / 100)));
            }
        });

        // Calculate Food items
        selectedFood.forEach((curr) => {
            const food = availableFood.find(f => f.id === curr.id);
            const gross = (food?.price || 0) * curr.quantity;
            extrasGross += gross;
            vatExtras += gross - (gross / 1.23);
        });

        const newSubtotal = baseGross;
        const newExtras = extrasGross;
        const newVatBase = Number(vatBase.toFixed(2));
        const newVatExtras = Number(vatExtras.toFixed(2));
        const newTotal = baseGross + extrasGross;

        // Log context to help debug
        // console.log("Recalculating price...", { isEdit, subtotal: newSubtotal, extras: newExtras, total: newTotal });

        // In edit mode, ONLY update if the user has manually changed a price-impacting field.
        const { dirtyFields } = form.formState;
        
        // Sometimes React Hook Form doesn't mark array changes as dirty correctly without useFieldArray.
        // We track changes to extras/food strings to be sure.
        const extrasStr = JSON.stringify(selectedExtras);
        const foodStr = JSON.stringify(selectedFood);
        const forceUpdate = isFirstCalculation.current || 
                           (extrasStr !== (form as any)._prevExtrasStr) || 
                           (foodStr !== (form as any)._prevFoodStr);
        
        (form as any)._prevExtrasStr = extrasStr;
        (form as any)._prevFoodStr = foodStr;

        const isDirty = (
            dirtyFields.boat_id ||
            dirtyFields.program_id ||
            dirtyFields.date ||
            dirtyFields.selected_extras ||
            dirtyFields.selected_food ||
            dirtyFields.boarding_location ||
            dirtyFields.passengers_adults ||
            dirtyFields.passengers_children ||
            dirtyFields.extra_hours
        );

        // MORE ROBUST PROTECTION: Use getFieldState to avoid proxy issues
        const fieldState = form.getFieldState("subtotal_amount");
        const isManualSubtotal = fieldState.isDirty;
        const currentSubtotalValue = Number(form.getValues("subtotal_amount")) || 0;
        
        const isCriticalChange = dirtyFields.boat_id || dirtyFields.program_id;
        
        // If the user typed something (> 0) and we are about to overwrite it with 0
        // (because no program is selected), we treat it as a manual override too.
        const isLikelyManual = isManualSubtotal || (currentSubtotalValue > 0 && newSubtotal === 0);

        if (isLikelyManual && !isCriticalChange) {
            const manualTotal = currentSubtotalValue + newExtras;
            
            form.setValue("extras_amount", newExtras);
            form.setValue("total_amount", manualTotal);
            
            // Still update vat fields for consistency
            form.setValue("vat_base_amount", newVatBase);
            form.setValue("vat_extras_amount", newVatExtras);
            return;
        }

        if (isEdit) {
            if (!isDirty && !forceUpdate) return;
        }

        // Standard calculation
        form.setValue("subtotal_amount", newSubtotal);
        form.setValue("extras_amount", newExtras);
        form.setValue("vat_base_amount", newVatBase);
        form.setValue("vat_extras_amount", newVatExtras);
        form.setValue("total_amount", newTotal);

        isFirstCalculation.current = false;
    }, [
        selectedBoatId,
        selectedProgramId,
        season,
        JSON.stringify(selectedExtras),
        JSON.stringify(selectedFood),
        selectedBoardingLocation,
        boatPrograms,
        boatExtras,
        availableFood,
        form,
        isPartner,
        totalPassengers,
        selectedBoat,
        enabled,
        isEdit,
        form.formState.dirtyFields, // Explicitly watch dirtyFields
        form.watch("extra_hours"),
        form.watch("subtotal_amount")
    ]);

    return { boatPrograms, boatExtras, season };
}
