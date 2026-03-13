"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

import { Button } from "@/components/ui/button";

interface ImageUploadProps {
    disabled?: boolean;
    onChange: (value: string) => void;
    onRemove: () => void;
    value: string;
}

export function ImageUpload({
    disabled,
    onChange,
    onRemove,
    value
}: ImageUploadProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onUpload = (result: any) => {
        onChange(result.info.secure_url);
    };

    if (!isMounted) {
        return null;
    }

    return (
        <div className="space-y-4">
            {value ? (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-md border border-white/20 bg-black/5">
                    <div className="z-10 absolute top-2 right-2">
                        <Button type="button" onClick={onRemove} variant="destructive" size="icon" className="h-8 w-8 rounded-full shadow-lg hover:scale-105 transition-all">
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                    <Image
                        fill
                        className="object-cover"
                        alt="Image"
                        src={value}
                    />
                </div>
            ) : (
                <CldUploadWidget
                    onSuccess={onUpload}
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "greenbreeze_uploads"}
                    options={{
                        maxFiles: 1,
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
                                className="w-full rounded-2xl border-dashed border-2 border-[#44C3B2]/50 hover:border-[#44C3B2] bg-white/50 hover:bg-[#44C3B2]/10 text-[#0A1F1C] transition-all h-32 flex flex-col items-center justify-center gap-3"
                            >
                                <ImagePlus className="h-8 w-8 text-[#44C3B2]" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Upload de Imagem</span>
                            </Button>
                        );
                    }}
                </CldUploadWidget>
            )}
        </div>
    );
}
