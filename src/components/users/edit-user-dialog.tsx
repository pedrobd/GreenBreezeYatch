"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { updateSystemUserProfile } from "@/app/actions/users";
import { toast } from "sonner";

interface EditUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: {
        id: string;
        fullName: string;
        role: string;
        email: string;
    };
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const payload = {
            fullName: formData.get("fullName") as string,
            role: formData.get("role") as "admin" | "booking_manager" | "skipper" | "marinheiro",
            password: formData.get("password") as string,
            email: formData.get("email") as string,
        };
        const result = await updateSystemUserProfile(user.id, payload);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Utilizador atualizado com sucesso.");
            onOpenChange(false);
        }

        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[750px] rounded-3xl border-white/50 bg-white/70 backdrop-blur-2xl shadow-2xl p-8 font-body border max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-heading text-2xl text-[#0A1F1C]">Editar Utilizador</DialogTitle>
                    <DialogDescription className="font-body text-[#0A1F1C]/60">
                        Altere as informações de perfil ou redefina a password.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-[#0A1F1C] font-semibold">Nome Completo</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                defaultValue={user.fullName}
                                placeholder="Ex: João Silva"
                                required
                                className="rounded-xl border-[#0A1F1C]/10 bg-white/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[#0A1F1C] font-semibold">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={user.email}
                                placeholder="exemplo@greenbreeze.pt"
                                required
                                className="rounded-xl border-[#0A1F1C]/10 bg-white/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-[#0A1F1C] font-semibold">Cargo (Role)</Label>
                            <Select name="role" defaultValue={user.role || "skipper"} required>
                                <SelectTrigger className="rounded-xl border-[#0A1F1C]/10 bg-white/50">
                                    <SelectValue placeholder="Selecione o cargo" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-white/50 bg-white/95 backdrop-blur-xl">
                                    <SelectItem value="admin">Administrador (Total)</SelectItem>
                                    <SelectItem value="booking_manager">Gestor de Reservas</SelectItem>
                                    <SelectItem value="skipper">Skipper</SelectItem>
                                    <SelectItem value="marinheiro">Marinheiro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[#0A1F1C] font-semibold flex items-center gap-2">
                                Mudar Password
                                <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-widest bg-black/5 px-2 py-0.5 rounded-full">Opcional</span>
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Deixe em branco"
                                minLength={8}
                                className="rounded-xl border-[#0A1F1C]/10 bg-white/50"
                            />
                        </div>
                    </div>
                    
                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl hover:bg-black/5 text-black hover:text-black font-bold h-12"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl bg-[#0A1F1C] text-[#44C3B2] hover:bg-[#0A1F1C]/90 font-bold h-12 transition-all shadow-lg shadow-[#0A1F1C]/10 px-8"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    A gravar...
                                </>
                            ) : (
                                "Gravar Alterações"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
