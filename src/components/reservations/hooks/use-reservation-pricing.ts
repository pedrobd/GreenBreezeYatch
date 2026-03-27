import { useState, useEffect, useRef } from "react";
import { getBoatProgramsAction, getBoatExtrasAction } from "@/app/actions/fleet";
import { getExtrasAction } from "@/app/actions/extras";
import { getExtraActivitiesAction } from "@/app/actions/reservations";
import { UseFormReturn } from "react-hook-form";
import { ReservationFormValues } from "@/lib/validations/reservations";

interface UseReservationPricingProps {
    form: UseFormReturn<ReservationFormValues>;
    selectedBoatId: string;
    selectedDate: string;
    selectedProgramId: string;
    selectedActivities: any[];
    selectedFood: any[];
    selectedBoardingLocation: string;
    totalPassengers: number;
    isPartner: boolean;
    selectedBoat: any;
    availableFood: any[];
    enabled?: boolean;
    isEdit?: boolean;
}

export function useReservationPricing({
    form,
    selectedBoatId,
    selectedDate,
    selectedProgramId,
    selectedActivities,
    selectedFood,
    selectedBoardingLocation,
    totalPassengers,
    isPartner,
    selectedBoat,
    availableFood,
    enabled = true,
    isEdit = false
}: UseReservationPricingProps) {
    const [boatPrograms, setBoatPrograms] = useState<any[]>([]);
    const [boatExtras, setBoatExtras] = useState<any[]>([]);
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
            getBoatProgramsAction(selectedBoatId).then(res => setBoatPrograms(res.data || []));
            
            // Fetch all types of extras: boat-specific, global extras, and extra activities
            Promise.all([
                getBoatExtrasAction(selectedBoatId),
                getExtrasAction(),
                getExtraActivitiesAction()
            ]).then(([boatRes, globalRes, activityRes]) => {
                const combined = [
                    ...(boatRes.data || []),
                    ...(globalRes.data || []),
                    ...(activityRes.data || [])
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
        form.setValue("season_applied" as any, s);
    }, [selectedDate, form, enabled]);

    // Auto-calculate total amount and VAT
    useEffect(() => {
        if (!enabled) return;
        
        // Don't recalculate if we are waiting for boat-specific data
        const isDataLoaded = (selectedProgramId ? boatPrograms.length > 0 : true) && 
                            (selectedActivities.length > 0 ? (boatExtras.length > 0) : true);
        
        if (!isDataLoaded) return;

        const program = boatPrograms.find(p => p.id === selectedProgramId);
        let baseGross = 0;
        let vatBase = 0;

        if (program) {
            baseGross = program[`price_${season}`] || 0;
            const vatRate = program.vat_rate || 23;
            vatBase = baseGross - (baseGross / (1 + (vatRate / 100)));
        }

        const locationSurcharge = (!isPartner && selectedBoardingLocation === "Setúbal") ? (selectedBoat?.setubal_surcharge || 50) : 0;
        baseGross += locationSurcharge;

        let extrasGross = 0;
        let vatExtras = 0;

        selectedActivities.forEach((curr: any) => {
            const extra = boatExtras.find(e => e.id === curr.id);
            if (extra) {
                const isPerPerson = extra.pricing_type === 'per_person';
                const qty = isPerPerson ? totalPassengers : curr.quantity;
                const gross = (extra.price || 0) * qty;
                extrasGross += gross;
                const vatRate = extra.vat_rate || 23;
                vatExtras += gross - (gross / (1 + (vatRate / 100)));
            }
        });

        selectedFood.forEach((curr: any) => {
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

        // In edit mode, we ONLY update the form values if the user has manually changed a price-impacting field.
        // This prevents overwriting custom prices or handles the lag of loading data.
        const { dirtyFields } = form.formState;
        const isDirty = (
            dirtyFields.boat_id || 
            dirtyFields.program_id || 
            dirtyFields.date || 
            dirtyFields.selected_activities || 
            dirtyFields.selected_food || 
            dirtyFields.boarding_location || 
            dirtyFields.passengers_adults || 
            dirtyFields.passengers_children ||
            dirtyFields.extra_hours
        );

        if (isEdit && !isDirty) {
            return;
        }

        const currentValues = form.getValues();
        
        if (currentValues.subtotal_amount !== newSubtotal) form.setValue("subtotal_amount", newSubtotal, { shouldDirty: false });
        if (currentValues.extras_amount !== newExtras) form.setValue("extras_amount", newExtras, { shouldDirty: false });
        if (currentValues.vat_base_amount !== newVatBase) form.setValue("vat_base_amount", newVatBase, { shouldDirty: false });
        if (currentValues.vat_extras_amount !== newVatExtras) form.setValue("vat_extras_amount", newVatExtras, { shouldDirty: false });
        if (currentValues.total_amount !== newTotal) form.setValue("total_amount", newTotal, { shouldDirty: false });

    }, [
        selectedBoatId, 
        selectedProgramId, 
        season, 
        JSON.stringify(selectedActivities), 
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
        form.formState.dirtyFields // Add dirtyFields to dependencies
    ]);

    return { boatPrograms, boatExtras, season };
}
