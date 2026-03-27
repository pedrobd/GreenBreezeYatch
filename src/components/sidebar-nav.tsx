"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Ship,
    CalendarDays,
    UtensilsCrossed,
    Activity,
    PenTool,
    Settings,
    BarChart3,
    LogOut,
    Users,
    UsersRound,
    Sparkles,
    Tag,
} from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

interface NavItem {
    title: string;
    href: string;
    icon: any;
    roles?: ("admin" | "booking_manager" | "skipper" | "marinheiro")[];
}

const sidebarNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
        roles: ["admin", "booking_manager"],
    },
    {
        title: "Reservas",
        href: "/reservations",
        icon: CalendarDays,
        roles: ["admin", "booking_manager", "skipper", "marinheiro"],
    },
    {
        title: "Frota",
        href: "/fleet",
        icon: Ship,
        roles: ["admin"],
    },
    {
        title: "Menu (Refeições)",
        href: "/food",
        icon: UtensilsCrossed,
        roles: ["admin", "booking_manager"],
    },
    {
        title: "Extras",
        href: "/extras",
        icon: Sparkles,
        roles: ["admin", "booking_manager"],
    },
    {
        title: "Cupons",
        href: "/coupons",
        icon: Activity, // Using Activity as a placeholder or Tag if available
        roles: ["admin", "booking_manager"],
    },
    {
        title: "Blog",
        href: "/blog",
        icon: PenTool,
        roles: ["admin"],
    },
    {
        title: "Equipa",
        href: "/team",
        icon: UsersRound,
        roles: ["admin"],
    },
    {
        title: "Estatísticas",
        href: "/analytics",
        icon: BarChart3,
        roles: ["admin"],
    },
    {
        title: "Utilizadores",
        href: "/users",
        icon: Users,
        roles: ["admin"],
    },
    {
        title: "Configurações",
        href: "/settings",
        icon: Settings,
        roles: ["admin"],
    },
];

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    role?: "admin" | "booking_manager" | "skipper" | "marinheiro";
}

export function SidebarNav({ className, role, ...props }: SidebarNavProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        const result = await signOutAction();
        if (result.success) {
            router.push("/login"); // Fallback redirect just in case revalidatePath isn't enough
        }
    };

    // Filter items based on user role
    const filteredItems = sidebarNavItems.filter((item) => {
        if (!item.roles) return true;
        if (!role) return false;
        return item.roles.includes(role);
    });

    return (
        <nav
            className={cn(
                "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-4",
                className
            )}
            {...props}
        >
            {filteredItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden",
                            isActive
                                ? "bg-white/10 text-[#44C3B2] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                                : "text-white/50 hover:text-white/80 hover:bg-white/5"
                        )}
                    >
                        <item.icon className={cn(
                            "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                            isActive ? "text-[#44C3B2] drop-shadow-[0_0_8px_rgba(68,195,178,0.4)]" : ""
                        )} />
                        <span className="font-body tracking-wide">{item.title}</span>

                        {isActive && (
                            <div className="absolute right-0 top-0 h-full w-1 bg-[#44C3B2] rounded-l-full shadow-[0_0_15px_rgba(68,195,178,0.8)]" />
                        )}
                    </Link>
                );
            })}

            <button
                onClick={handleSignOut}
                className="group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden text-white/50 hover:text-red-400 hover:bg-red-500/10"
            >
                <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-body tracking-wide">Sair</span>
            </button>
        </nav>
    );
}
