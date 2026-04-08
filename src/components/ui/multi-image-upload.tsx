"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Trash, GripVertical } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

import { Button } from "@/components/ui/button";
import { cn, optimizeCloudinaryUrl } from "@/lib/utils";
import { useRef } from "react";

interface MultiImageUploadProps {
    disabled?: boolean;
    onChange: (value: string[]) => void;
    onRemove: (url: string) => void;
    value: string[];
}

export function MultiImageUpload({
    disabled,
    onChange,
    onRemove,
    value = []
}: MultiImageUploadProps) {
    const [isMounted, setIsMounted] = useState(false);
    const accumulatedUrls = useRef<string[]>(value || []);

    useEffect(() => {
        accumulatedUrls.current = value || [];
    }, [value]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onUpload = (result: any) => {
        const newUrl = result.info.secure_url;
        if (newUrl && !accumulatedUrls.current.includes(newUrl)) {
            const nextUrls = [...accumulatedUrls.current, newUrl];
            accumulatedUrls.current = nextUrls;
            onChange(nextUrls);
        }
    };

    if (!isMounted) {
        return null;
    }

    // Safety check for Cloudinary Cloud Name
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        return (
            <div className="space-y-4">
                <Button
                    type="button"
                    disabled
                    variant="outline"
                    className="w-full rounded-2xl border-dashed border-2 border-red-200 bg-red-50/50 text-red-600 h-24 flex flex-col items-center justify-center gap-2 cursor-not-allowed"
                >
                    <ImagePlus className="h-6 w-6 opacity-50" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Configuração Cloudinary em Falta</span>
                    <span className="text-[8px] font-medium opacity-70">Defina NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME na Vercel</span>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {value && value.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {value.map((url, index) => (
                        <div key={url} className="relative aspect-video rounded-2xl overflow-hidden shadow-sm border border-white/20 bg-black/5 group">
                            <div className="z-10 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button type="button" onClick={() => onRemove(url)} variant="destructive" size="icon" className="h-7 w-7 rounded-full shadow-lg hover:scale-105 transition-all">
                                    <Trash className="h-3 w-3" />
                                </Button>
                            </div>
                            <Image
                                fill
                                className="object-cover"
                                alt={`Gallery Image ${index + 1}`}
                                src={optimizeCloudinaryUrl(url, 'thumb')}
                            />
                        </div>
                    ))}
                </div>
            )}

            <CldUploadWidget
                onSuccess={onUpload}
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "greenbreeze_uploads"}
                options={{
                    maxFiles: 10,
                    multiple: true,
                    styles: {
                        palette: {
                            window: "#FFFFFF",
                            windowBorder: "#90a0b3",
                            tabIcon: "#44C3B2",
                            menuIcons: "#0A1F1C",
                            textDark: "#0A1F1C",
                            textLight: "#FFFFFF",
                            link: "#44C3B2",
                            action: "#44C3B2",
                            inactiveTabIcon: "#0A1F1C",
                            error: "#F44235",
                            inProgress: "#44C3B2",
                            complete: "#20B832",
                            sourceBg: "#E4EBF1"
                        }
                    }
                }}
            >
                {({ open }) => {
                    const onClick = () => {
                        open();
                    };

                    return (
                        <Button
                            type="button"
                            disabled={disabled}
                            variant="outline"
                            onClick={onClick}
                            className="w-full rounded-2xl border-dashed border-2 border-[#44C3B2]/50 hover:border-[#44C3B2] bg-white/50 hover:bg-[#44C3B2]/10 text-[#0A1F1C] transition-all h-24 flex flex-col items-center justify-center gap-2"
                        >
                            <ImagePlus className="h-6 w-6 text-[#44C3B2]" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                {value && value.length > 0 ? "Adicionar Mais Imagens" : "Upload de Imagens"}
                            </span>
                        </Button>
                    );
                }}
            </CldUploadWidget>
        </div>
    );
}
