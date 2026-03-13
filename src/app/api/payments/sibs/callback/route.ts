import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { verifySibsCallback } from '@/utils/sibs';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const signature = req.headers.get('x-sibs-signature') || '';

        // 1. Verify Signature
        if (!verifySibsCallback(body, signature)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // 2. Extract Data
        const { merchantReference, status, paymentId } = body;

        // 3. Update Reservation Status in Supabase
        const supabase = createAdminClient();

        let paymentStatus = 'Falhou';
        if (status === 'Success' || status === 'PROCESSED') {
            paymentStatus = 'Pago';
        }

        const { error } = await supabase
            .from('reservations')
            .update({
                payment_status: paymentStatus,
                status: paymentStatus === 'Pago' ? 'Confirmado' : 'Pendente'
            })
            .eq('id', merchantReference); // Assuming merchantReference is the reservation ID

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('SIBS Callback Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
