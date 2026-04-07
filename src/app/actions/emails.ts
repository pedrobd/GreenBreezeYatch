"use server";

import { Resend } from "resend";
import { createAdminClient } from "@/utils/supabase/admin";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ReservationEmailData {
    id: string;
    client_name: string;
    client_email: string;
    date: string;
    boat_name: string;
    program_name: string;
    total_amount: number;
    skipper_id?: string | null;
    marinheiro_id?: string | null;
}

const REVIEW_LINK = "https://www.google.com/search?q=Green%20Breeze%20%7C%20Set%C3%BAbal%20%7C%20Yach...#lkt=LocalPoiReviews";

/**
 * Sends tailored confirmation emails to client, admin, owner, content manager, and crew.
 */
export async function sendReservationEmails(data: ReservationEmailData) {
    if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is not defined");
        return { error: "Configuração de email em falta." };
    }

    try {
        const adminClient = createAdminClient();
        const formattedDate = format(new Date(data.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

        // 1. Fetch Recipients from Profiles & Team
        const { data: profiles } = await adminClient.from("profiles").select("email, role");

        const adminEmails = profiles?.filter(p => p.role === 'admin').map(p => p.email) || ["info@greenbreeze.pt"];
        const managerEmails = profiles?.filter(p => p.role === 'booking_manager').map(p => p.email) || [];

        // Crew
        let crewEmails: string[] = [];
        if (data.skipper_id) {
            const { data: skipper } = await adminClient.from("team").select("email").eq("id", data.skipper_id).single();
            if (skipper?.email) crewEmails.push(skipper.email);
        }
        if (data.marinheiro_id) {
            const { data: marinheiro } = await adminClient.from("team").select("email").eq("id", data.marinheiro_id).single();
            if (marinheiro?.email) crewEmails.push(marinheiro.email);
        }

        // 2. Email for Client (Bilingual PT/EN Placeholder)
        await resend.emails.send({
            from: "GreenBreeze <onboarding@resend.dev>",
            to: [data.client_email],
            subject: "Confirmação de Reserva / Booking Confirmation - GreenBreeze",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h1 style="color: #44C3B2;">Olá, ${data.client_name}!</h1>
                    <p>A sua reserva na <strong>GreenBreeze</strong> foi confirmada com sucesso.</p>
                    <p><em>Your booking with <strong>GreenBreeze</strong> has been successfully confirmed.</em></p>
                    <hr />
                    <p><strong>Detalhes / Details:</strong></p>
                    <ul>
                        <li><strong>Data / Date:</strong> ${formattedDate}</li>
                        <li><strong>Barco / Boat:</strong> ${data.boat_name}</li>
                        <li><strong>Programa / Program:</strong> ${data.program_name}</li>
                    </ul>
                    <p>Estamos ansiosos por recebê-lo a bordo!</p>
                    <p>Até breve,<br />Equipa GreenBreeze</p>
                </div>
            `,
        });

        // 3. Email for Crew (Skipper & Marinheiro - Focus on operation)
        if (crewEmails.length > 0) {
            await resend.emails.send({
                from: "GreenBreeze Fleet <onboarding@resend.dev>",
                to: crewEmails,
                subject: `Escala de Serviço: ${formattedDate} - ${data.boat_name}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2 style="color: #0A1F1C;">Escala de Serviço - Nova Reserva</h2>
                        <p>Tens uma nova reserva atribuída:</p>
                        <p><strong>Barco:</strong> ${data.boat_name}</p>
                        <p><strong>Data:</strong> ${formattedDate}</p>
                        <p><strong>Programa:</strong> ${data.program_name}</p>
                        <p><strong>Cliente:</strong> ${data.client_name}</p>
                        <br />
                        <p>Desejamos-te uma excelente navegação! ⚓</p>
                    </div>
                `,
            });
        }

        // 4. Email for Admin, Owner, and Content Manager (Operational & Financial Overview)
        const internalRecipients = [...new Set([...adminEmails, ...managerEmails])];
        if (internalRecipients.length > 0) {
            await resend.emails.send({
                from: "GreenBreeze Admin <onboarding@resend.dev>",
                to: internalRecipients,
                subject: `Nova Reserva Registada: ${data.client_name} - ${data.boat_name}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2 style="color: #0A1F1C;">Resumo Operacional</h2>
                        <p><strong>Cliente:</strong> ${data.client_name} (${data.client_email})</p>
                        <p><strong>Data:</strong> ${formattedDate}</p>
                        <p><strong>Barco:</strong> ${data.boat_name}</p>
                        <p><strong>Programa:</strong> ${data.program_name}</p>
                        <p><strong>Valor Total:</strong> ${data.total_amount}€</p>
                        <br />
                        <div style="margin-top: 20px;">
                            <a href="https://admin.greenbreeze.pt/reservations" style="background: #44C3B2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Gerir Reserva no Backoffice</a>
                        </div>
                    </div>
                `,
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error sending notification emails:", error);
        return { error: "Falha ao enviar notificações." };
    }
}

/**
 * Sends the Google Review request email.
 */
export async function sendReviewRequestEmail(clientEmail: string, clientName: string) {
    if (!process.env.RESEND_API_KEY) return;

    try {
        await resend.emails.send({
            from: "GreenBreeze <feedback@greenbreeze.pt>",
            to: [clientEmail],
            subject: "Como foi a sua experiência com a GreenBreeze?",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
                    <h1 style="color: #44C3B2;">Obrigado por navegar connosco!</h1>
                    <p>Olá, ${clientName}. Esperamos que tenha desfrutado da sua viagem.</p>
                    <p>A sua opinião é muito importante para nós. Poderia dedicar um minuto para nos avaliar no Google?</p>
                    <br />
                    <a href="${REVIEW_LINK}" style="background: #44C3B2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Avaliar no Google</a>
                    <p style="margin-top: 30px; color: #888; font-size: 12px;">Equipa GreenBreeze</p>
                </div>
            `,
        });
        return { success: true };
    } catch (error) {
        console.error("Error sending review email:", error);
        return { error: "Falha ao enviar pedido de review." };
    }
}
/**
 * Sends cancellation emails to client and admin team.
 */
export async function sendCancellationEmail(data: {
    id: string;
    client_name: string;
    client_email: string;
    date: string;
    boat_name: string;
}) {
    if (!process.env.RESEND_API_KEY) return;

    try {
        let formattedDate = data.date;
        try {
            formattedDate = format(new Date(data.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
        } catch (e) {
            console.error("Date formatting error in email:", e);
        }

        console.log(`Attempting to send cancellation email to ${data.client_email} from onboarding@resend.dev`);

        // 1. Email for Client
        const clientEmailResponse = await resend.emails.send({
            from: "GreenBreeze <onboarding@resend.dev>",
            to: [data.client_email],
            subject: "Reserva Cancelada / Booking Cancelled - GreenBreeze",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #e67e22;">Reserva Cancelada</h1>
                        <p style="color: #666;">Olá, ${data.client_name}.</p>
                    </div>
                    <p>Confirmamos o cancelamento da sua reserva para o dia <strong>${formattedDate}</strong> no barco <strong>${data.boat_name}</strong>.</p>
                    <p><em>We confirm the cancellation of your booking for <strong>${formattedDate}</strong> on the boat <strong>${data.boat_name}</strong>.</em></p>
                    <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 20px 0;" />
                    <p style="font-size: 14px; color: #666;">Se tiver alguma questão sobre reembolsos ou pretender reagendar, por favor responda a este e-mail.</p>
                    <p style="font-size: 14px; color: #666;"><em>If you have questions about refunds or wish to reschedule, please reply to this email.</em></p>
                    <br />
                    <p>Esperamos vê-lo em breve,<br />Equipa GreenBreeze</p>
                </div>
            `,
        });

        console.log("Resend client response:", clientEmailResponse);

        // 2. Internal Notification
        const { data: profiles } = await createAdminClient().from("profiles").select("email").eq("role", "admin");
        const adminEmails = profiles?.map(p => p.email) || ["info@greenbreeze.pt"];

        const adminEmailResponse = await resend.emails.send({
            from: "GreenBreeze Admin <onboarding@resend.dev>",
            to: adminEmails,
            subject: `Reserva CANCELADA: ${data.client_name} - ${data.boat_name}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2 style="color: #e67e22;">Alerta de Cancelamento</h2>
                    <p>A seguinte reserva foi cancelada no sistema:</p>
                    <ul>
                        <li><strong>ID:</strong> ${data.id}</li>
                        <li><strong>Cliente:</strong> ${data.client_name}</li>
                        <li><strong>Data:</strong> ${formattedDate}</li>
                        <li><strong>Barco:</strong> ${data.boat_name}</li>
                    </ul>
                    <p>Verifique o estado de pagamentos/reembolsos se necessário.</p>
                </div>
            `,
        });

        console.log("Resend admin response:", adminEmailResponse);

        return { success: true };
    } catch (error) {
        console.error("Error sending cancellation email:", error);
        return { error: "Falha ao enviar email de cancelamento." };
    }
}
