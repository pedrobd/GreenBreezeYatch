import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Optimizes a Cloudinary URL by injecting f_auto and q_auto parameters.
 * @param url The original Cloudinary secure_url
 * @param mode Optional optimization mode (standard, hero, thumb)
 */
export function optimizeCloudinaryUrl(url: string | null | undefined, mode: 'standard' | 'hero' | 'thumb' = 'standard'): string {
    if (!url || typeof url !== 'string') return url || '';
    
    if (url.includes('res.cloudinary.com') && !url.includes('f_auto')) {
        let params = 'f_auto,q_auto';
        if (mode === 'hero') {
            params = 'f_auto,q_auto,w_1920,c_limit';
        } else if (mode === 'thumb') {
            params = 'f_auto,q_auto,w_600,c_fill,g_auto';
        }
        return url.replace('/image/upload/', `/image/upload/${params}/`);
    }
    return url;
}
