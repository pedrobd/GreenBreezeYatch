import * as z from "zod";

export const systemSettingsSchema = z.object({
    gemini_api_key: z.string().optional(),
    brand_tone: z.string().optional(),
    seo_keywords: z.string().optional(),
    marina_name: z.string().optional(),
    language: z.string().optional(),
    timezone: z.string().optional(),
});

export type SystemSettingsFormValues = z.infer<typeof systemSettingsSchema>;
