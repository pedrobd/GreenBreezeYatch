import { useFormContext } from "react-hook-form";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES } from "@/lib/constants/countries";
import { User, Mail, Phone, FileText } from "lucide-react";
import { ReservationFormValues } from "@/types/admin";

export function ClientInfoSection() {
  const { control } = useFormContext<ReservationFormValues>();
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <User className="h-5 w-5" />
        Informações do Cliente
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="client_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-[#0A1F1C]/70">Nome do Cliente</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-[#0A1F1C]/40" />
                  <Input placeholder="Nome completo" className="pl-9" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="client_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-[#0A1F1C]/70">Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#0A1F1C]/40" />
                  <Input type="email" placeholder="exemplo@email.com" className="pl-9" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="client_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-[#0A1F1C]/70">Telefone</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[#0A1F1C]/40" />
                  <Input placeholder="+351 900 000 000" className="pl-9" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="client_nif"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-[#0A1F1C]/70">NIF (Opcional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 h-4 w-4 text-[#0A1F1C]/40" />
                  <Input placeholder="999999999" className="pl-9" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="client_country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-[#0A1F1C]/70">País</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um país" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
