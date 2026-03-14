/** @type {import('next').NextConfig} */
const securityHeaders = [
    {
        key: "X-DNS-Prefetch-Control",
        value: "on",
    },
    {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
    },
    {
        key: "X-Frame-Options",
        value: "DENY",
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        key: "X-XSS-Protection",
        value: "1; mode=block",
    },
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
    },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    },
    {
        key: "Content-Security-Policy",
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://www.google.com https://www.gstatic.com https://res.cloudinary.com https://widget.cloudinary.com https://upload-widget.cloudinary.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://res.cloudinary.com https://gtaytqkzonbiyfmjwtbd.supabase.co https://maps.gstatic.com https://maps.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://gtaytqkzonbiyfmjwtbd.supabase.co wss://gtaytqkzonbiyfmjwtbd.supabase.co https://sandbox.sibspayments.com https://api.resend.com *.cloudinary.com; frame-src https://www.google.com https://sandbox.sibspayments.com https://widget.cloudinary.com https://upload-widget.cloudinary.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;",
    },
];

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: securityHeaders,
            },
        ];
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
