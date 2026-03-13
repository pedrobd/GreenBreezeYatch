"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Sparkles, Save, ShieldCheck, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { systemSettingsSchema, SystemSettingsFormValues } from "@/lib/validations/settings";
import { getSystemSettingsAction, updateSystemSettingsAction } from "@/app/actions/settings";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AiSettings() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const form = useForm<SystemSettingsFormValues>({
        resolver: zodResolver(systemSettingsSchema),
        defaultValues: {
            gemini_api_key: "",
            brand_tone: "",
            seo_keywords: "",
        },
    });

    useEffect(() => {
        async function loadSettings() {
            const { settings, error } = await getSystemSettingsAction();
            if (error) {
                toast.error("Erro ao carregar definições.");
            } else if (settings) {
                form.reset({
                    gemini_api_key: settings.gemini_api_key || "",
                    brand_tone: settings.brand_tone || "",
                    seo_keywords: settings.seo_keywords || "",
                });
            }
            setFetching(false);
        }
        loadSettings();
    }, [form]);

    async function onSubmit(values: SystemSettingsFormValues) {
        setLoading(true);
        const result = await updateSystemSettingsAction(values);
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Configurações de IA guardadas!");
        }
    }

    if (fetching) {
        return <div className="p-8 text-center opacity-50">A carregar configurações...</div>;
    }

    return (
        <Card className="rounded-3xl border-white/50 bg-white/40 shadow-xl backdrop-blur-xl border transition-all">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#0A1F1C] text-[#44C3B2] flex items-center justify-center shadow-lg shadow-[#0A1F1C]/10 shrink-0">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="font-heading text-2xl text-[#0A1F1C]">Inteligência Artificial (Gemini)</CardTitle>
                        <CardDescription className="font-body text-[#0A1F1C]/60 text-xs mt-1">Configure o motor de geração de conteúdo para o blog.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8 pt-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="gemini_api_key"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Gemini API Key</FormLabel>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3 w-3 text-[#0A1F1C]/30 cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-[10px]">Obtenha a chave gratuita no Google AI Studio.</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type="password"
                                                placeholder="AIzaSy..."
                                                {...field}
                                                className="rounded-xl border-white/50 bg-white/50 focus:bg-white h-12 pr-10"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <ShieldCheck className="h-4 w-4 text-[#44C3B2]" />
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-[10px] italic">
                                        A chave é guardada de forma segura e encriptada.
                                    </FormDescription>
                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="brand_tone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Tom de Voz da Marca</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ex: Sofisticado, sustentável, inspirador..."
                                            {...field}
                                            className="rounded-xl border-white/50 bg-white/50 focus:bg-white min-h-[100px]"
                                        />
                                    </FormControl>
                                    <FormDescription className="text-[10px]">
                                        Descreva como o Gemini deve escrever para a GreenBreeze.
                                    </FormDescription>
                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="seo_keywords"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-[#0A1F1C]/50">Palavras-Chave Focadas (SEO/GEO)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ex: marina de luxo algarve, barcos elétricos, ecoturismo..."
                                            {...field}
                                            className="rounded-xl border-white/50 bg-white/50 focus:bg-white h-12"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                </FormItem>
                            )}
                        />

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-[#0A1F1C] text-[#44C3B2] hover:bg-[#0A1F1C]/90 shadow-xl shadow-[#0A1F1C]/10 font-bold px-8 py-6 h-auto transition-all hover:scale-[1.02]"
                            >
                                {loading ? "A guardar..." : "Guardar Definições de IA"}
                                <Save className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
