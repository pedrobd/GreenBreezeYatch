import * as React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value?: string;
    onChange?: (value: string) => void;
}

const COUNTRY_CODES = [
    { code: "+351", country: "PT" },
    { code: "+34", country: "ES" },
    { code: "+33", country: "FR" },
    { code: "+44", country: "GB" },
    { code: "+49", country: "DE" },
    { code: "+39", country: "IT" },
    { code: "+31", country: "NL" },
    { code: "+32", country: "BE" },
    { code: "+41", country: "CH" },
    { code: "+43", country: "AT" },
    { code: "+353", country: "IE" },
    { code: "+45", country: "DK" },
    { code: "+46", country: "SE" },
    { code: "+47", country: "NO" },
    { code: "+358", country: "FI" },
    { code: "+48", country: "PL" },
    { code: "+420", country: "CZ" },
    { code: "+36", country: "HU" },
    { code: "+30", country: "GR" },
    { code: "+55", country: "BR" },
    { code: "+1", country: "US/CA" },
    { code: "+244", country: "AO" },
    { code: "+258", country: "MZ" },
    { code: "+238", country: "CV" },
    { code: "+245", country: "GW" },
    { code: "+239", country: "ST" },
    { code: "+670", country: "TL" },
];

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ className, value, onChange, ...props }, ref) => {
        // try to split value into prefix and number if it starts with +
        const [prefix, setPrefix] = React.useState("+351");
        const [number, setNumber] = React.useState("");

        React.useEffect(() => {
            if (value) {
                const match = COUNTRY_CODES.find(c => value.startsWith(c.code));
                if (match) {
                    setPrefix(match.code);
                    setNumber(value.slice(match.code.length).trim());
                } else {
                    setNumber(value);
                }
            }
        }, [value]);

        const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newNumber = e.target.value;
            setNumber(newNumber);
            if (onChange) {
                onChange(`${prefix} ${newNumber}`.trim());
            }
        };

        const handlePrefixChange = (newPrefix: string) => {
            setPrefix(newPrefix);
            if (onChange) {
                onChange(`${newPrefix} ${number}`.trim());
            }
        };

        return (
            <div className={cn("flex gap-2 w-full", className)}>
                <Select value={prefix} onValueChange={handlePrefixChange}>
                    <SelectTrigger className="w-[110px] h-10 rounded-xl border-white/50 bg-white/50 focus:ring-[#44C3B2] px-3 shadow-none text-xs">
                        <SelectValue placeholder="+351" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-white/50 bg-white/90 backdrop-blur-xl max-h-[250px] overflow-y-auto">
                        {COUNTRY_CODES.map((c) => (
                            <SelectItem key={c.country + c.code} value={c.code} className="text-xs">
                                <span className="font-bold">{c.code}</span> <span className="opacity-50 ml-1">{c.country}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    type="tel"
                    ref={ref}
                    value={number}
                    onChange={handleNumberChange}
                    className="flex-1 rounded-xl border-white/50 bg-white/50 focus-visible:ring-[#44C3B2] h-10 shadow-none text-sm"
                    placeholder="Número"
                    {...props}
                />
            </div>
        );
    }
);
PhoneInput.displayName = "PhoneInput";
