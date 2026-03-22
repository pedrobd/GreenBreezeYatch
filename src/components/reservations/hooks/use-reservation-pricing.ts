import { useState, useEffect } from "react";
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
    availableFood
}: UseReservationPricingProps) {
    const [boatPrograms, setBoatPrograms] = useState<any[]>([]);
    const [boatExtras, setBoatExtras] = useState<any[]>([]);
    const [season, setSeason] = useState<'low' | 'mid' | 'high'>('low');

    // Fetch Programs & Extras when Boat changes
    useEffect(() => {
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
    }, [selectedBoatId]);

    // Calculate Season
    useEffect(() => {
        if (!selectedDate) return;
        const month = new Date(selectedDate).getMonth(); // 0-11
        let s: 'low' | 'mid' | 'high' = 'low';
        if ([5, 6, 7, 8].includes(month)) s = 'high';
        else if ([3, 4, 9].includes(month)) s = 'mid';
        setSeason(s);
        form.setValue("season_applied" as any, s);
    }, [selectedDate, form]);

    // Auto-calculate total amount and VAT
    useEffect(() => {
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

        form.setValue("subtotal_amount", baseGross);
        form.setValue("extras_amount", extrasGross);
        form.setValue("vat_base_amount", Number(vatBase.toFixed(2)));
        form.setValue("vat_extras_amount", Number(vatExtras.toFixed(2)));
        form.setValue("total_amount", baseGross + extrasGross);

    }, [
        selectedBoatId, selectedProgramId, season, selectedActivities, 
        selectedFood, selectedBoardingLocation, boatPrograms, 
        boatExtras, availableFood, form, isPartner, totalPassengers, selectedBoat
    ]);

    return { boatPrograms, boatExtras, season };
}
