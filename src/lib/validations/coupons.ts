import * as z from "zod";

export const couponSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3, "O código deve ter pelo menos 3 caracteres.").toUpperCase(),
  discount_percentage: z.coerce.number().min(1, "O desconto deve ser pelo menos 1%.").max(100, "O desconto não pode exceder 100%."),
  boat_ids: z.array(z.string()).nullable().optional(),
  start_date: z.string().min(1, "Data de início é obrigatória."),
  end_date: z.string().min(1, "Data de fim é obrigatória."),
  is_active: z.boolean().default(true),
});

export type CouponFormValues = z.infer<typeof couponSchema>;
