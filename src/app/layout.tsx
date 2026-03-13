import "./globals.css";
import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider";

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: '--font-playfair',
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: '--font-outfit',
});

export const metadata: Metadata = {
    title: "GreenBreeze Backoffice",
    description: "Sistema de Gestão GreenBreeze",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt" suppressHydrationWarning className={`${playfair.variable} ${outfit.variable}`}>
            <body suppressHydrationWarning className={`${outfit.className} min-h-screen bg-background`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster position="top-right" richColors />
                </ThemeProvider>
            </body>
        </html>
    );
}
