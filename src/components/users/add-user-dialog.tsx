"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { UserPlus, Loader2 } from "lucide-react";
import { createSystemUser } from "@/app/actions/users";
import { toast } from "sonner";

export function AddUserDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const result = await createSystemUser(formData);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Utilizador criado com sucesso.");
            setOpen(false);
        }

        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-xl bg-[#0A1F1C] text-[#44C3B2] hover:bg-[#0A1F1C]/90 font-bold transition-all gap-2">
                    <UserPlus className="h-4 w-4" />
                    Novo Utilizador
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[750px] rounded-3xl border-white/50 bg-white/70 backdrop-blur-2xl shadow-2xl p-8 font-body border max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-heading text-2xl text-[#0A1F1C]">Criar Utilizador</DialogTitle>
                    <DialogDescription className="font-body text-[#0A1F1C]/60">
                        Adicione um novo membro à administração do backoffice.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-[#0A1F1C] font-semibold">Nome Completo</Label>
                            <Input
                                id="fullName"
                                name="fullName"
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
                                placeholder="exemplo@greenbreeze.pt"
                                required
                                className="rounded-xl border-[#0A1F1C]/10 bg-white/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[#0A1F1C] font-semibold">Password Temporária</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Min. 8 caracteres"
                                required
                                minLength={8}
                                className="rounded-xl border-[#0A1F1C]/10 bg-white/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role" className="text-[#0A1F1C] font-semibold">Cargo (Role)</Label>
                            <Select name="role" defaultValue="skipper" required>
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
                    </div>
                    <DialogFooter className="pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-[#0A1F1C] text-[#44C3B2] hover:bg-[#0A1F1C]/90 font-bold h-12 transition-all shadow-lg shadow-[#0A1F1C]/10"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    A criar...
                                </>
                            ) : (
                                "Criar Conta"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
