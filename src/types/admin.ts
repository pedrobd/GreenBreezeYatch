import { ReservationFormValues } from "@/lib/validations/reservations";

export type { ReservationFormValues };

export interface Boat {
  id: string;
  name: string;
  type: string;
  capacity: number;
  current_location: string;
  status: "Disponível" | "Manutenção" | "Indisponível";
  base_price: number;
  image_url?: string | null;
  gallery?: string[];
  is_partner?: boolean;
  setubal_surcharge?: number;
  description?: string | null;
  inclusions?: string | null;
  order_index?: number;
}

export interface BoatProgram {
  id: string;
  name: string;
  duration_hours: number;
  price_low: number;
  price_mid: number;
  price_high: number;
  vat_rate: number;
  is_active: boolean;
}

export interface BoatExtra {
  id: string;
  name: string;
  price: number;
  pricing_type: 'per_person' | 'per_booking';
  vat_rate?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  price: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'skipper' | 'marinheiro';
  rate_sunset?: number | null;
  rate_half_day?: number | null;
  rate_6hour?: number | null;
  rate_full_day?: number | null;
  rate_extra_hour?: number | null;
}

export interface StaffRate {
  id: string;
  staff_role: "skipper" | "marinheiro";
  program_code: string;
  base_value: number;
  extra_hour_value: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  boat_ids: string[] | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at?: string;
}
