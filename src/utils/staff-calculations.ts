export interface StaffRate {
    id: string;
    staff_role: "skipper" | "marinheiro";
    program_code: string;
    base_value: number;
    extra_hour_value: number;
}

export function calculateStaffPayout(
    role: "skipper" | "marinheiro",
    programCode: string,
    extraHours: number,
    rates: StaffRate[],
    memberRates?: {
        rate_sunset?: number | null;
        rate_half_day?: number | null;
        rate_6hour?: number | null;
        rate_full_day?: number | null;
        rate_extra_hour?: number | null;
    }
) {
    const isFullDay = programCode.toLowerCase().includes("full");
    const isHalfDay = programCode.toLowerCase().includes("half");
    const isSunset = programCode.toLowerCase().includes("sunset") || programCode.toLowerCase().includes("3h");
    const is6h = programCode.toLowerCase().includes("6 hour") || programCode.toLowerCase().includes("6h");

    // Order of priority:
    // 1. Member specific rates
    // 2. Global staff rates from table

    let baseAmount = 0;
    let extraRate = 0;

    if (memberRates) {
        if (isSunset && memberRates.rate_sunset) baseAmount = Number(memberRates.rate_sunset);
        else if (is6h && memberRates.rate_6hour) baseAmount = Number(memberRates.rate_6hour);
        else if (isFullDay && memberRates.rate_full_day) baseAmount = Number(memberRates.rate_full_day);
        else if (isHalfDay && memberRates.rate_half_day) baseAmount = Number(memberRates.rate_half_day);

        if (memberRates.rate_extra_hour) extraRate = Number(memberRates.rate_extra_hour);
    }

    // Fallback if member rates are not set
    if (baseAmount === 0 || extraRate === 0) {
        const globalRate = rates.find(
            (r) => r.staff_role === role && r.program_code.toLowerCase() === programCode.toLowerCase()
        );
        if (globalRate) {
            if (baseAmount === 0) baseAmount = Number(globalRate.base_value || 0);
            if (extraRate === 0) extraRate = Number(globalRate.extra_hour_value || 0);
        }
    }

    return baseAmount + (extraHours * extraRate);
}

export function detectProgramFromTime(time: string) {
    const t = time.toLowerCase();
    if (t.includes("sunset") || t.includes("3h")) return "Sunset";
    if (t.includes("6 hora") || t.includes("6h")) return "6 Hour";
    if (t.includes("dia inteiro") || t.includes("full day") || t.includes("8h")) return "Full Day";
    if (t.includes("meio dia") || t.includes("half day") || t.includes("4h")) return "Half Day";
    return "Hourly";
}
