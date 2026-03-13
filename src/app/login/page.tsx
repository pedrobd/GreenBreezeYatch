import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

export default async function LoginPage({
    searchParams
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const resolvedParams = await searchParams;
    const hasError = resolvedParams.error === 'true';

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-[#E8F5F2] p-4 lg:p-8 font-body">
            {/* Main Login Card Container */}
            <div className="flex flex-col lg:flex-row w-full max-w-6xl h-full lg:min-h-[600px] bg-white rounded-[2rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(16,54,48,0.15)] border border-white/20">

                {/* Left Section - Boat Image */}
                <div className="hidden lg:flex lg:w-1/2 relative min-h-[400px]">
                    <div
                        className="absolute inset-0 bg-cover bg-center z-0"
                        style={{ backgroundImage: "url('/boat-login.png')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#103630]/60 to-transparent z-10" />

                    <div className="relative z-20 flex flex-col justify-end p-12 text-white w-full h-full">
                        <div className="max-w-sm space-y-4">
                            <h2 className="text-3xl font-bold leading-tight font-heading">Green Breeze <br />Discover The Seas</h2>
                            <p className="text-sm opacity-80 leading-relaxed font-body">
                                Painel de Gestão Exclusivo para Administração de Reservas, Frota e Conteúdos.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section - Login Form */}
                <div className="flex flex-col justify-center items-center flex-1 px-8 py-12 lg:py-16 bg-white shrink-0">
                    <div className="w-full max-w-sm space-y-10">
                        {/* Logo Section */}
                        <div className="flex flex-col items-center space-y-6">
                            <div className="relative w-40 h-16">
                                <Image
                                    src="/logo.png"
                                    alt="Green Breeze Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div className="text-center space-y-1">
                                <h1 className="text-2xl font-bold text-[#061a17] font-heading">Painel de Controlo</h1>
                                <p className="text-[#3ba596] text-sm font-medium font-body">
                                    Bem-vindo de volta! Inicie sessão abaixo.
                                </p>
                            </div>
                        </div>

                        <form className="space-y-6" action={login}>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-semibold text-[#061a17] text-xs ml-1 font-body uppercase tracking-wider">ADMIN EMAIL</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="info@greenbreeze.pt"
                                        required
                                        className="h-14 px-5 rounded-2xl bg-zinc-50 border-zinc-100 focus-visible:ring-[#44c3b2] transition-all text-base font-body"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="font-semibold text-[#061a17] text-xs ml-1 font-body uppercase tracking-wider">PASSWORD</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="h-14 px-5 rounded-2xl bg-zinc-50 border-zinc-100 focus-visible:ring-[#44c3b2] transition-all text-base font-body"
                                    />
                                </div>
                            </div>

                            {hasError && (
                                <p className="text-sm font-medium text-red-800 bg-red-50/50 py-3 px-4 rounded-xl text-center border border-red-100/50 animate-in fade-in slide-in-from-top-1 font-body">
                                    Credenciais inválidas. Por favor, tente novamente.
                                </p>
                            )}

                            <Button type="submit" className="w-full h-14 text-lg font-bold bg-[#44c3b2] hover:bg-[#3ba596] text-white rounded-2xl shadow-xl shadow-[#44c3b2]/20 transition-all hover:scale-[1.02] active:scale-[0.98] font-body uppercase tracking-wide">
                                Entrar
                            </Button>
                        </form>

                        <div className="text-center text-[10px] uppercase tracking-widest text-zinc-400 pt-4 font-body">
                            &copy; {new Date().getFullYear()} Green Breeze Setúbal Bay
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
