"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Thermometer, Wind, Droplets, Waves, Moon, CloudSun, CloudMoon, CloudLightning, CloudDrizzle, CloudFog, Edit2, Check, RefreshCw } from "lucide-react";
import { getWeatherData, updateWeatherManualAction, WeatherData } from "@/app/actions/weather";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState<Partial<WeatherData>>({});

    useEffect(() => {
        async function fetchWeather() {
            try {
                const data = await getWeatherData();
                setWeather(data);
                setEditValues(data);
            } catch (error) {
                console.error("Failed to fetch weather:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchWeather();
    }, []);

    const handleUpdate = async () => {
        if (!weather) return;
        setLoading(true);
        try {
            const updated = { ...weather, ...editValues, isManual: true };
            await updateWeatherManualAction(updated);
            setWeather(updated);
            setIsEditing(false);
            toast.success("Condições meteorológicas atualizadas.");
        } catch (error) {
            toast.error("Erro ao atualizar dados.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !weather) {
        return (
            <div className="bg-white/5 rounded-[2rem] p-4 border border-white/10 animate-pulse">
                <div className="h-2 w-16 bg-white/10 rounded mb-2" />
                <div className="h-4 w-full bg-white/10 rounded" />
            </div>
        );
    }

    if (!weather) return null;

    const getIcon = (condition: string, isDay: boolean) => {
        const cond = condition.toLowerCase();
        const iconClass = "h-6 w-6 text-[#44C3B2]";

        if (cond.includes("thunder") || cond.includes("storm") || cond.includes("trovoada")) return <CloudLightning className={iconClass} />;
        if (cond.includes("rain") || cond.includes("chuva") || cond.includes("showers")) return <CloudRain className={iconClass} />;
        if (cond.includes("drizzle") || cond.includes("chuvisco")) return <CloudDrizzle className={iconClass} />;
        if (cond.includes("fog") || cond.includes("nevoeiro") || cond.includes("mist")) return <CloudFog className={iconClass} />;

        if (cond.includes("cloud") || cond.includes("nublado") || cond.includes("overcast") || cond.includes("encoberto")) {
            return isDay ? <CloudSun className={iconClass} /> : <CloudMoon className={iconClass} />;
        }

        return isDay ? <Sun className={iconClass} /> : <Moon className={iconClass} />;
    };

    return (
        <div className="relative group">
            {/* Quick Edit Overlay (Internal) */}
            {isEditing ? (
                <div className="bg-[#0A1F1C] rounded-[2rem] p-4 border border-[#44C3B2]/30 shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#44C3B2]">Corrigir Dados</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-white/40 hover:text-white" onClick={() => setIsEditing(false)}>
                                <Wind className="h-3 w-3 rotate-45" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[8px] uppercase text-white/40 font-bold ml-1">Temp °C</label>
                                <Input
                                    type="number"
                                    className="h-8 bg-white/10 border-white/5 text-xs text-white rounded-lg focus:ring-[#44C3B2]"
                                    value={editValues.temp}
                                    onChange={e => setEditValues({ ...editValues, temp: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[8px] uppercase text-white/40 font-bold ml-1">Vento km/h</label>
                                <Input
                                    type="number"
                                    className="h-8 bg-white/10 border-white/5 text-xs text-white rounded-lg focus:ring-[#44C3B2]"
                                    value={editValues.wind}
                                    onChange={e => setEditValues({ ...editValues, wind: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] uppercase text-white/40 font-bold ml-1">Humidade %</label>
                            <Input
                                type="number"
                                className="h-8 bg-white/10 border-white/5 text-xs text-white rounded-lg focus:ring-[#44C3B2]"
                                value={editValues.humidity}
                                onChange={e => setEditValues({ ...editValues, humidity: parseInt(e.target.value) })}
                            />
                        </div>
                        <Button
                            className="w-full h-8 bg-[#44C3B2] hover:bg-[#3ba596] text-[#0A1F1C] font-black text-[10px] uppercase tracking-widest rounded-lg mt-2 transition-all active:scale-95"
                            onClick={handleUpdate}
                        >
                            <Check className="h-3 w-3 mr-1" /> Guardar
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => setIsEditing(true)}
                    className="bg-white/5 rounded-[2rem] p-4 border border-white/5 hover:bg-white/10 hover:border-[#44C3B2]/30 transition-all duration-700 cursor-pointer group/weather shadow-inner"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-2xl bg-[#44C3B2]/10 group-hover/weather:scale-110 transition-transform duration-700 shadow-lg shadow-[#44C3B2]/5">
                                {getIcon(weather.condition, weather.isDay)}
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-white leading-none tracking-tighter">{weather.temp}°</span>
                                    {weather.isManual && <span className="h-1 w-1 rounded-full bg-[#44C3B2] animate-pulse" />}
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#44C3B2] leading-none mt-1.5 opacity-80">Tróia</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end opacity-40 group-hover/weather:opacity-100 transition-opacity">
                            <Edit2 className="h-3 w-3 text-white mb-1" />
                            <span className="text-[8px] text-white font-medium capitalize italic leading-none">{weather.condition}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2 opacity-60 group-hover/weather:opacity-100 transition-all">
                            <Wind className="h-3 w-3 text-[#44C3B2]" />
                            <span className="text-[10px] font-bold text-white tracking-tight">{weather.wind} km/h</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-60 group-hover/weather:opacity-100 transition-all justify-end">
                            <Droplets className="h-3 w-3 text-[#44C3B2]" />
                            <span className="text-[10px] font-bold text-white tracking-tight">{weather.humidity}% HR</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2 justify-center bg-[#44C3B2]/5 py-2 rounded-xl mt-1 border border-[#44C3B2]/10 group-hover/weather:bg-[#44C3B2]/10 transition-colors">
                            <Waves className="h-3 w-3 text-[#44C3B2]" />
                            <span className="text-[9px] font-black text-[#44C3B2] tracking-widest uppercase">Mar: {weather.seaTemp}°C</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
